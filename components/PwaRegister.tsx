"use client";

import { useEffect } from "react";

const registerServiceWorker = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.register("/sw.js").catch(() => {});
};

export default function PwaRegister() {
  useEffect(() => {
    const onLoad = () => registerServiceWorker();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
