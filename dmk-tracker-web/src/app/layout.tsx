import "./globals.css";
import Footer from "@/components/layout/shared/Footer";
import BackToTop from "@/components/layout/shared/BackToTop";
import RouteMagicLoader from "@/components/layout/shared/loading";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <title>DMK Tracker</title>
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
    </head>
    <body className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">   
      <main className="flex-1">
        <RouteMagicLoader>
          {children}
        </RouteMagicLoader>
      </main>
      <BackToTop />
      <Footer />     
    </body>
    </html>
  );
}
