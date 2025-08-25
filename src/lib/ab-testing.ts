import { Analytics } from './analytics';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    percentage: number;
    conditions?: {
      device?: 'mobile' | 'desktop' | 'tablet';
      location?: string[];
      newUser?: boolean;
      returningUser?: boolean;
    };
  };
  variants: Variant[];
  metrics: {
    primary: string;
    secondary: string[];
  };
  results?: ExperimentResults;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number;
  config: Record<string, any>;
}

interface ExperimentResults {
  totalParticipants: number;
  variantResults: Array<{
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    isWinner?: boolean;
  }>;
  statisticalSignificance: boolean;
  winningVariant?: string;
}

interface UserAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  userId?: string;
  sessionId: string;
}

export class ABTestingFramework {
  private static experiments = new Map<string, Experiment>();
  private static userAssignments = new Map<string, UserAssignment>();
  private static isInitialized = false;

  // Initialize A/B testing framework
  static init(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.loadExperiments();
    this.loadUserAssignments();
  }

  // Load experiments from storage or API
  private static loadExperiments(): void {
    // In production, load from API
    const mockExperiments: Experiment[] = [
      {
        id: 'download-button-test',
        name: 'Download Button Optimization',
        description: 'Test different download button designs and copy',
        status: 'running',
        startDate: new Date('2024-01-01'),
        targetAudience: {
          percentage: 50,
          conditions: {
            device: 'mobile'
          }
        },
        variants: [
          {
            id: 'control',
            name: 'Original Button',
            description: 'Current download button design',
            weight: 50,
            config: {
              buttonText: 'Download',
              buttonColor: 'blue',
              buttonSize: 'medium'
            }
          },
          {
            id: 'variant-a',
            name: 'Green CTA Button',
            description: 'Green button with action-oriented text',
            weight: 50,
            config: {
              buttonText: 'Get Wallpaper',
              buttonColor: 'green',
              buttonSize: 'large'
            }
          }
        ],
        metrics: {
          primary: 'download_conversion',
          secondary: ['button_clicks', 'time_on_page']
        }
      },
      {
        id: 'homepage-layout-test',
        name: 'Homepage Layout Test',
        description: 'Test different homepage layouts for better engagement',
        status: 'running',
        startDate: new Date('2024-01-15'),
        targetAudience: {
          percentage: 30,
          conditions: {
            newUser: true
          }
        },
        variants: [
          {
            id: 'control',
            name: 'Current Layout',
            description: 'Existing homepage layout',
            weight: 50,
            config: {
              layout: 'grid',
              featuredSection: true,
              heroSize: 'large'
            }
          },
          {
            id: 'variant-b',
            name: 'Masonry Layout',
            description: 'Pinterest-style masonry layout',
            weight: 50,
            config: {
              layout: 'masonry',
              featuredSection: false,
              heroSize: 'small'
            }
          }
        ],
        metrics: {
          primary: 'engagement_rate',
          secondary: ['bounce_rate', 'pages_per_session', 'session_duration']
        }
      }
    ];

    mockExperiments.forEach(exp => {
      this.experiments.set(exp.id, exp);
    });
  }

  // Load user assignments from storage
  private static loadUserAssignments(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_assignments');
      if (stored) {
        const assignments = JSON.parse(stored);
        assignments.forEach((assignment: UserAssignment) => {
          this.userAssignments.set(assignment.experimentId, assignment);
        });
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }

  // Save user assignments to storage
  private static saveUserAssignments(): void {
    if (typeof window === 'undefined') return;

    try {
      const assignments = Array.from(this.userAssignments.values());
      localStorage.setItem('ab_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }

  // Get variant for user in experiment
  static getVariant(experimentId: string, userId?: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is eligible for experiment
    if (!this.isUserEligible(experiment)) {
      return null;
    }

    // Check existing assignment
    const existingAssignment = this.userAssignments.get(experimentId);
    if (existingAssignment) {
      return experiment.variants.find(v => v.id === existingAssignment.variantId) || null;
    }

    // Assign user to variant
    const variant = this.assignUserToVariant(experiment, userId);
    if (variant) {
      const assignment: UserAssignment = {
        experimentId,
        variantId: variant.id,
        assignedAt: new Date(),
        userId,
        sessionId: this.getSessionId()
      };

      this.userAssignments.set(experimentId, assignment);
      this.saveUserAssignments();

      // Track experiment exposure
      this.trackExperimentExposure(experimentId, variant.id);
    }

    return variant;
  }

  // Check if user is eligible for experiment
  private static isUserEligible(experiment: Experiment): boolean {
    const { targetAudience } = experiment;

    // Check percentage targeting
    const hash = this.hashUserId(this.getSessionId());
    if (hash % 100 >= targetAudience.percentage) {
      return false;
    }

    // Check conditions
    if (targetAudience.conditions) {
      const { device, location, newUser, returningUser } = targetAudience.conditions;

      // Device targeting
      if (device && !this.matchesDevice(device)) {
        return false;
      }

      // Location targeting
      if (location && !this.matchesLocation(location)) {
        return false;
      }

      // User type targeting
      if (newUser !== undefined || returningUser !== undefined) {
        const isReturning = this.isReturningUser();
        if (newUser && isReturning) return false;
        if (returningUser && !isReturning) return false;
      }
    }

    return true;
  }

  // Assign user to variant based on weights
  private static assignUserToVariant(experiment: Experiment, userId?: string): Variant | null {
    const { variants } = experiment;
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    const hash = this.hashUserId(userId || this.getSessionId());
    const threshold = (hash % 100) / 100 * totalWeight;
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (threshold <= currentWeight) {
        return variant;
      }
    }

    return variants[0]; // Fallback
  }

  // Track experiment exposure
  private static trackExperimentExposure(experimentId: string, variantId: string): void {
    Analytics.trackPageView(`/experiment/${experimentId}/${variantId}`);
  }

  // Track experiment conversion
  static trackConversion(experimentId: string, metricName: string, value?: number): void {
    const assignment = this.userAssignments.get(experimentId);
    if (!assignment) return;

    // Track conversion event
    Analytics.trackDownload(`experiment_${experimentId}_${assignment.variantId}`, metricName);

    // Update experiment results
    this.updateExperimentResults(experimentId, assignment.variantId, metricName, value);
  }

  // Update experiment results
  private static updateExperimentResults(
    experimentId: string, 
    variantId: string, 
    metricName: string, 
    value?: number
  ): void {
    // In production, send to analytics backend
    console.log(`Conversion tracked: ${experimentId} - ${variantId} - ${metricName}`, value);
  }

  // Get experiment configuration for variant
  static getExperimentConfig(experimentId: string): Record<string, any> | null {
    const variant = this.getVariant(experimentId);
    return variant?.config || null;
  }

  // Check if user is in experiment
  static isInExperiment(experimentId: string): boolean {
    return this.userAssignments.has(experimentId);
  }

  // Get all active experiments for user
  static getActiveExperiments(): Array<{ experimentId: string; variantId: string }> {
    return Array.from(this.userAssignments.entries()).map(([experimentId, assignment]) => ({
      experimentId,
      variantId: assignment.variantId
    }));
  }

  // Utility functions
  private static hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private static matchesDevice(targetDevice: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    switch (targetDevice) {
      case 'mobile':
        return /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      case 'tablet':
        return /tablet|ipad|playbook|silk/i.test(userAgent);
      case 'desktop':
        return !/mobile|tablet|android|iphone|ipod|ipad|blackberry|iemobile|opera mini|playbook|silk/i.test(userAgent);
      default:
        return true;
    }
  }

  private static matchesLocation(targetLocations: string[]): boolean {
    // In production, use geolocation API or IP-based location
    // For now, return true
    return true;
  }

  private static isReturningUser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      localStorage.setItem('has_visited', 'true');
      return false;
    }
    return true;
  }

  // Admin functions for managing experiments
  static createExperiment(experiment: Omit<Experiment, 'results'>): void {
    this.experiments.set(experiment.id, experiment as Experiment);
  }

  static updateExperiment(experimentId: string, updates: Partial<Experiment>): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      Object.assign(experiment, updates);
      this.experiments.set(experimentId, experiment);
    }
  }

  static stopExperiment(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'completed';
      experiment.endDate = new Date();
      this.experiments.set(experimentId, experiment);
    }
  }

  static getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    return experiment?.results || null;
  }

  // Get all experiments (for admin dashboard)
  static getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }
}

// React hook for A/B testing
export function useABTest(experimentId: string) {
  const variant = ABTestingFramework.getVariant(experimentId);
  const config = variant?.config || {};
  
  const trackConversion = (metricName: string, value?: number) => {
    ABTestingFramework.trackConversion(experimentId, metricName, value);
  };

  return {
    variant: variant?.id || 'control',
    config,
    trackConversion,
    isInExperiment: ABTestingFramework.isInExperiment(experimentId)
  };
}

// Initialize A/B testing framework
if (typeof window !== 'undefined') {
  ABTestingFramework.init();
}
