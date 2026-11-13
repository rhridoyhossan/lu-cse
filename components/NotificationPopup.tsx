"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, X } from "lucide-react";
import type { PageNotification } from "@/lib/googleSheets";

interface NotificationPopupProps {
  notifications?: PageNotification[];
}

function sanitizeNotificationHtml(rawHtml: string): string {
  if (typeof window === "undefined") return rawHtml;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    const blockedTags = [
      "script",
      "iframe",
      "object",
      "embed",
      "link",
      "style",
      "form",
      "input",
      "button",
      "textarea",
    ];
    blockedTags.forEach((tag) => {
      doc.querySelectorAll(tag).forEach((el) => el.remove());
    });

   const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase().trim();
        if (
          name.startsWith("on") ||
          value.startsWith("javascript:") ||
          value.startsWith("data:text/html")
        ) {
          el.removeAttribute(attr.name);
        }
      });

     if (el.tagName.toLowerCase() === "a") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.classList.add(
          "text-cyan-400",
          "underline",
          "underline-offset-2",
          "hover:text-cyan-300",
          "transition-colors"
        );
      }

      if (el.tagName.toLowerCase() === "img") {
        el.classList.add(
          "max-w-full",
          "h-auto",
          "rounded-lg",
          "border",
          "border-slate-800",
          "my-2",
          "object-contain"
        );
      }

      if (el.tagName.toLowerCase() === "table") {
        el.classList.add(
          "w-full",
          "border-collapse",
          "border",
          "border-slate-800",
          "my-3",
          "text-sm"
        );
      }
      if (el.tagName.toLowerCase() === "th" || el.tagName.toLowerCase() === "td") {
        el.classList.add(
          "border",
          "border-slate-800",
          "px-3",
          "py-1.5",
          "text-left"
        );
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error("Failed to sanitize notification HTML:", err);
    return rawHtml;
  }
}

function normalizePath(path: string): string {
  const clean = path.split("?")[0].split("#")[0].trim();
  if (!clean || clean === "/") return "/";
  return clean.replace(/\/+$/, "");
}

export default function NotificationPopup({
  notifications = [],
}: NotificationPopupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<PageNotification | null>(null);

  const matchedNotification = useMemo(() => {
    if (!notifications || notifications.length === 0) return null;
    const currentNormalized = normalizePath(pathname || "/");

    return (
      notifications.find((item) => {
        const itemNormalized = normalizePath(item.slug);
        return itemNormalized === currentNormalized;
      }) || null
    );
  }, [notifications, pathname]);

  useEffect(() => {
    if (matchedNotification) {
      setActiveNotice(matchedNotification);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setActiveNotice(null);
    }
  }, [matchedNotification]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeNotice]);

  if (!isOpen || !activeNotice) return null;
  const sanitizedHtml = sanitizeNotificationHtml(activeNotice.html);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-950/40 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/40 text-cyan-400">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Announcement
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  {activeNotice.slug === "/" ? "Home" : activeNotice.slug}
                </span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close notification"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="text-sm leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1 space-y-2 [&_p]:mb-2 [&_b]:text-white [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow-sm hover:shadow-cyan-500/20"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

