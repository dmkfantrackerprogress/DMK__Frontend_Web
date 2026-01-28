import "./globals.css";
import Header from "@/components/layout/shared/Header";
import Footer from "@/components/layout/shared/Footer";
import BackToTop from "@/components/layout/shared/BackToTop";

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
        <Header />
        <main className="flex-1">{children}</main>
        <BackToTop />
        <Footer />     
      </body>
    </html>
  );
}
