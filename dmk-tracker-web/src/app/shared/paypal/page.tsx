import { FaPaypal } from "react-icons/fa";

export default function PaypalPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          Support <span className="text-indigo-600">DMK Tracker</span>
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-10">
          DMK Tracker is a free tool for players.  
          If you find it useful, consider supporting the development.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* Support Tier 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-2">Small Support</h3>
            <p className="text-gray-500 text-sm mb-4">
              Help cover basic server costs.
            </p>
            <div className="text-2xl font-bold mb-4">$1</div>
            <a
              href="https://www.paypal.com/paypalme/YoonFai/1"
              target="_blank"
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPaypal />
              Donate
            </a>
          </div>

          {/* Support Tier 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-2 border-indigo-500">
            <h3 className="font-semibold text-lg mb-2">Popular</h3>
            <p className="text-gray-500 text-sm mb-4">
              Support new features & updates.
            </p>
            <div className="text-2xl font-bold mb-4">$5</div>
            <a
              href="https://www.paypal.com/paypalme/YoonFai/5"
              target="_blank"
              className="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              <FaPaypal />
              Donate
            </a>
          </div>

          {/* Support Tier 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-2">Big Support</h3>
            <p className="text-gray-500 text-sm mb-4">
              Help long-term development.
            </p>
            <div className="text-2xl font-bold mb-4">$10</div>
            <a
              href="https://www.paypal.com/paypalme/YoonFai/10"
              target="_blank"
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPaypal />
              Donate
            </a>
          </div>

        </div>

        {/* Custom donation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <h3 className="text-xl font-semibold mb-3">
            Custom Donation
          </h3>

          <p className="text-gray-500 mb-6">
            Want to support with a different amount?
          </p>

          <a
            href="https://www.paypal.com/paypalme/YoonFai"
            target="_blank"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            <FaPaypal />
            Donate via PayPal
          </a>
        </div>

      </div>
    </div>
  );
}