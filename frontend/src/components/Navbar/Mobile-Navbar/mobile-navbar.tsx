"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Home, ScanLine, ArchiveX } from "lucide-react";

const navItems = [
  {
    title: "Products",
    href: "/inventory",
    icon: Home,
  },
  {
    title: "Scan",
    href: "/scan",
    icon: ScanLine,
  }
];

export default function MobileNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#585858]">
      <ul className="flex items-center justify-around h-[95px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <li key={item.title}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              >
                <item.icon className="h-7 w-7" />
                <span className="text-xs">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
