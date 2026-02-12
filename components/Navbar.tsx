"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Desktop Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".nav-logo",
        { scale: 0.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1 },
      ).fromTo(
        ".nav-link",
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1 },"<0.2"
      );
    },
    { scope: containerRef, dependencies: [pathname] },
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/notices", label: "Notices" },
    { href: "/events", label: "Events" },
    { href: "/curriculum", label: "Curriculum" },
    { href: "/resources", label: "Library" },
    { href: "/achievements", label: "Trophies" },
  ];

  return (
    <nav
      ref={containerRef}
      className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="nav-logo font-mono font-bold text-xl text-white"
        >
          Campus_<span className="text-cyan-500">OS</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-sm font-mono transition-colors ${
                pathname === link.href
                  ? "text-cyan-400 border-b-2 border-cyan-500 pb-1"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* MOBILE MENU TRIGGER */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-75 bg-slate-950 border-l border-slate-800 p-0 text-white visible md:hidden"
          >
            <MobileMenu
              links={links}
              setIsOpen={setIsOpen}
              pathname={pathname}
            />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

const MobileMenu = ({
  links,
  setIsOpen,
  pathname,
}: {
  links: { href: string; label: string }[];
  setIsOpen: (val: boolean) => void;
  pathname: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".mobile-link",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
      );
    },
    { scope: containerRef }, 
  );

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <SheetTitle className="mobile-link font-mono font-bold text-xl text-white">
          Campus_<span className="text-cyan-500">OS</span>
        </SheetTitle>
      </div>

      <div className="flex flex-col p-6 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={`mobile-link text-lg font-mono py-2 transition-colors flex items-center justify-between group ${
              pathname === link.href
                ? "text-cyan-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {link.label}
            <span
              className={`text-slate-700 group-hover:text-cyan-500 transition-colors ${
                pathname === link.href ? "text-cyan-500" : ""
              }`}
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
