import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Contact Us | Wallpaper Gallery | Customer Support & Inquiries",
  description: "Get in touch with our wallpaper experts. Contact us for download questions, device optimization help, custom requests, or customer support. We're here to help personalize your devices.",
  keywords: ["contact wallpaper gallery", "customer support", "wallpaper help", "download support"],
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed answers to your questions",
    contact: "support@wallpapergallery.com",
    action: "mailto:support@wallpapergallery.com"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    contact: "1-800-WALLPAPER",
    action: "tel:1-800-925-5727"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Instant help during business hours",
    contact: "Available on our website",
    action: "#"
  }
];

const supportTopics = [
  {
    icon: HelpCircle,
    title: "Download Questions",
    description: "Resolution options, file formats, and device compatibility information"
  },
  {
    icon: MapPin,
    title: "Device Optimization",
    description: "Tips for setting wallpapers on different devices and screen resolutions"
  },
  {
    icon: Clock,
    title: "Custom Requests",
    description: "Special resolution requests, bulk downloads, and personalized collections"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            We're here to help with all your digital wallpaper needs
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                  <IconComponent className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {method.description}
                  </p>
                  <a
                    href={method.action}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {method.contact}
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Support Topics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How We Can Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a topic</option>
                  <option value="download-question">Download Question</option>
                  <option value="device-help">Device Optimization Help</option>
                  <option value="resolution-request">Resolution Request</option>
                  <option value="custom-request">Custom Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Please provide as much detail as possible about your question or request..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Business Hours */}
        <section className="mb-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Business Hours
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Support
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                  <p>Saturday: 9:00 AM - 6:00 PM EST</p>
                  <p>Sunday: 10:00 AM - 4:00 PM EST</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Response Times
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>Email: Within 24 hours</p>
                  <p>Phone: Immediate during business hours</p>
                  <p>Live Chat: Immediate during business hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section>
          <div className="bg-blue-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Quick Answers?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Check our frequently asked questions for instant help with common topics.
            </p>
            <a
              href="/search"
              className="inline-block bg-white text-blue-600 font-medium py-3 px-6 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Browse Wallpapers
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
