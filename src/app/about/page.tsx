import { Heart, Award, Users, Palette, Shield, Truck } from "lucide-react";

export const metadata = {
  title: "About Us | Digital Wallpaper Gallery | Our Story & Mission",
  description: "Learn about our passion for digital wallpapers, commitment to quality, and mission to help you personalize your devices with stunning backgrounds. Discover our story and values.",
  keywords: ["about wallpaper gallery", "digital wallpaper company", "screen customization", "device personalization"],
};

const values = [
  {
    icon: Heart,
    title: "Passion for Design",
    description: "We believe beautiful screens inspire and motivate. Our curated collection reflects our passion for exceptional digital design and visual quality."
  },
  {
    icon: Award,
    title: "Quality First",
    description: "Every wallpaper in our collection meets our strict quality standards. We source high-resolution images and optimize them for perfect display quality."
  },
  {
    icon: Users,
    title: "User Focused",
    description: "Your experience is our priority. We provide easy downloads, multiple resolutions, and wallpapers optimized for every device type."
  },
  {
    icon: Palette,
    title: "Design Innovation",
    description: "We stay ahead of digital trends while honoring timeless aesthetics. Our collection balances cutting-edge design with classic appeal."
  }
];

const features = [
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "All our wallpapers come with a satisfaction guarantee. If you're not happy, we'll make it right."
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free shipping on orders over $75. Most orders ship within 24 hours for quick room transformations."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            About Wallpaper Gallery
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Transforming homes with beautiful wallpapers since our founding
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Story */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Wallpaper Gallery was born from a simple belief: every screen has the potential to be extraordinary.
                What started as a passion project has grown into a comprehensive destination for premium digital wallpapers
                that transform ordinary devices into inspiring, personalized experiences.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We understand that choosing a wallpaper is more than just selecting an image—it's about creating
                an atmosphere, expressing personality, and making your device truly yours. That's why we've carefully
                curated our collection to include designs that speak to every style, from modern minimalism to
                vibrant gaming aesthetics.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Our team of design experts works tirelessly to source and create the finest digital wallpapers
                from talented artists and photographers worldwide. We believe in quality that showcases your display's
                capabilities, designs that inspire, and downloads that exceed expectations.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* What Sets Us Apart */}
        <section className="mb-16">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Curated Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Every wallpaper is hand-selected by our design team for quality, style, and versatility.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Expert Guidance
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our team provides personalized recommendations and installation support for every project.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Customer Care
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We're committed to your satisfaction from selection through installation and beyond.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Promise to You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start">
                    <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              To inspire and empower people to create beautiful, personalized spaces through exceptional 
              wallpaper designs, expert guidance, and unmatched customer service. We believe every wall 
              tells a story—let us help you tell yours.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
