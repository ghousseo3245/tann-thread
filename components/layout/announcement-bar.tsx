"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/site.config";
import { useSiteSetting } from "@/lib/use-site-setting";

export function AnnouncementBar() {
  // A saved announcement_text setting overrides the rotating messages.
  // Empty/whitespace keeps the defaults.
  const customMessage = useSiteSetting("announcement_text");
  const messages = customMessage.trim()
    ? [customMessage.trim()]
    : siteConfig.announcementMessages;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      className="h-9 flex items-center justify-center px-4 text-center bg-espresso text-ivory/90 text-xs tracking-wide"
      aria-live="polite"
    >
      <span key={index} className="animate-backdrop-in">
        {messages[index]}
      </span>
    </div>
  );
}
