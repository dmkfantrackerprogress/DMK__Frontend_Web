"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteMagicLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 250);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      {show && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse" />
        </div>
      )}
      {children}
    </>
  );
}
