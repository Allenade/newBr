"use client";

import { motion } from "framer-motion";
import { Shield, Users, Globe, Award } from "lucide-react";
import Header from "../home/component/header";
import Footer from "../home/component/footer";

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-black to-[#0a1929] py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white">
                Vaultixes{" "}
              </h1>
              <p className="text-gray-400 text-lg">
                We are a leading cryptocurrency trading platform dedicated to
                providing secure and efficient trading solutions for our global
                community.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 bg-[#0a1929]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white">
                  Our Mission
                </h2>
                <p className="text-gray-400 mb-6">
                  At Aspen Marketpip, we are committed to democratizing access
                  to cryptocurrency trading by providing a secure, user-friendly
                  platform that empowers both novice and experienced traders.
                </p>
                <p className="text-gray-400">
                  Our mission is to create a transparent and efficient trading
                  environment where users can confidently participate in the
                  digital asset market.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <Shield className="h-8 w-8 text-[#FFCC00] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Security First</h3>
                  <p className="text-sm text-gray-400">
                    Advanced security measures to protect your assets
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <Users className="h-8 w-8 text-[#FFCC00] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Global Community
                  </h3>
                  <p className="text-sm text-gray-400">
                    Join our growing community of traders
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <Globe className="h-8 w-8 text-[#FFCC00] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-400">
                    Round-the-clock customer assistance
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <Award className="h-8 w-8 text-[#FFCC00] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Trusted Platform
                  </h3>
                  <p className="text-sm text-gray-400">
                    Reliable and transparent trading experience
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-white">
                Our Values
              </h2>
              <p className="text-gray-400 mb-12">
                We operate on a foundation of core values that guide our
                decisions and shape our platform&apos;s development.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-2 text-[#FFCC00]">
                    Transparency
                  </h3>
                  <p className="text-gray-400">
                    Clear and honest communication with our users
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-2 text-[#FFCC00]">
                    Innovation
                  </h3>
                  <p className="text-gray-400">
                    Continuous improvement of our platform
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-2 text-[#FFCC00]">
                    Excellence
                  </h3>
                  <p className="text-gray-400">
                    Commitment to providing the best service
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
