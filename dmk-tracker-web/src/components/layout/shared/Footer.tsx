import { FaYoutube, FaPaypal ,FaGithub, FaDiscord } from "react-icons/fa";
import { BiCoffeeTogo } from "react-icons/bi";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
        
        {/* Left side */}
        <div>
          © {new Date().getFullYear()} <span className="font-semibold">DMK Tracker</span>.  
          Developed by DMK Everyday. All rights reserved.
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <span className="hidden sm:block text-gray-500">
            Follow for updates
          </span>

          <a
            href="https://www.youtube.com/channel/UCWglQCKuzNDGw7ZRtNGdLpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-red-500 transition text-lg"
          >
            <FaYoutube />
          </a>

          {/* PayPal */}
          <a
            href="/shared/paypal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition text-lg"
          >
            <BiCoffeeTogo />
          </a>

          {/*<a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-black dark:hover:text-white transition text-lg"
          >
            <FaGithub />
          </a>

          <a
            href="https://discord.gg/your-server"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-indigo-500 transition text-lg"
          >
            <FaDiscord />
          </a>*/}
        </div>

      </div>
    </footer>
  );
}