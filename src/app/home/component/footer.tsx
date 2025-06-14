import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-6">
              <div className="relative h-14 w-40">
                {/* <Image
                  src="/placeholder.svg?height=56&width=160"
                  alt="Aspen Marketpip"
                  width={160}
                  height={56}
                  className="object-contain"
                /> */}
                <div className="absolute inset-0 flex flex-col justify-center">
                  <div className="text-[#FFCC00] font-bold text-xl">Dovexa</div>
                  {/* <div className="text-[#FFCC00] font-bold text-xl">
                    MARKETPIP
                  </div> */}
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Over 50000 TH/s Earned Daily! Are you looking for an Honest and
              Responsible Bitcoin Mining Company with Excellent Mining Packages
              and Multi-level Marketing? Start Today at Dovexa!!
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-[#FFCC00] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#FFCC00] transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#FFCC00] transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#FFCC00] transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-[#FFCC00] flex-shrink-0" />
                <span>
                  52 Vanderbilt Ave, New York, NY 10017, United States
                </span>
              </li>
              <li className="flex text-gray-400">
                <Mail className="h-5 w-5 mr-3 text-[#FFCC00] flex-shrink-0" />
                <span>support@Dovexa</span>
              </li>
              <li className="flex text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-[#FFCC00] flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About us
                </Link>
              </li>

              <li>
                <Link
                  href="/auth/signup"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Investment Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">About Dovexa</h3>
            <p className="text-gray-400 mb-6">
              Dovexa is totally different from its competitors trying to achieve
              something special starting with the website design, trading
              platform, and extremely functional.
            </p>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-[#FFCC00] mr-2" />
              <div>
                <div className="text-sm font-medium">Secure Trading</div>
                <div className="text-xs text-gray-500">SSL Encrypted</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8 text-sm">
          <Link
            href="/trade"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Trade
          </Link>
          <Link
            href="/cryptos"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cryptos
          </Link>
          <Link
            href="/indices"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Indices
          </Link>
          <Link
            href="/forex"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Forex
          </Link>
          <Link
            href="/energies"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Energies
          </Link>
          <Link
            href="/shares"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Shares
          </Link>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Dovexa. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Legal
              </Link>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-6">
            RISK WARNING: The Financial Products offered by the company include
            Contracts for Difference (&apos;CFDs&apos;) and other complex
            financial products. Trading CFDs carries a high level of risk since
            leverage can work both to your advantage and disadvantage. As a
            result, CFDs may not be suitable for all investors because you may
            lose all your invested capital. You should not risk more than you
            are prepared to lose. Before deciding to trade, you need to ensure
            that you understand the risks involved taking into account your
            investment objectives and level of experience. Past performance of
            CFDs is not a reliable indicator of future results. Most CFDs have
            no set maturity date. Hence, a CFD position matures on the date you
            choose to close an existing open position. Seek independent advice,
            if necessary. Please read our Risk Disclosure Notice.
          </p>
        </div>
      </div>
    </footer>
  );
}
