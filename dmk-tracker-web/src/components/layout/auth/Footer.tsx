export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-gray-2000 flex justify-end">
        © {new Date().getFullYear()} DMK Tracker Develop By DMK Everyday. All rights reserved.
      </div>

    </footer>
  );
}
