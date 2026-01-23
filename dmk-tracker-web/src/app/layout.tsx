import "./globals.css";
import Header from "@/components/layout/auth/Header";
import Footer from "@/components/layout/auth/Footer";
import BackToTop from "@/components/layout/auth/BackToTop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">     
        <Header />
        <main className="flex-1">{children}</main>
        <BackToTop />
        <Footer />     
      </body>
    </html>
  );
}
