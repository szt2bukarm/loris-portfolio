"use client"
import { useEffect } from "react";
import { useStore } from "./useStore";

export default function MobileTest() {
  const { setIsMobile } = useStore();

  useEffect(() => {
    const checkIfMobile = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipod|android|mobile/.test(ua);
      const isIpad =
        /ipad/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      return isMobileUA || isIpad;
    };
    setIsMobile(checkIfMobile());
  }, []);

  return null;
}