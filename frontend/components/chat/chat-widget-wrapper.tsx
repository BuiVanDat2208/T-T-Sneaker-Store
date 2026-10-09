"use client";

import { useEffect, useState } from "react";
import { ChatWidget } from "./chat-widget";

export function ChatWidgetWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ChatWidget />;
}
