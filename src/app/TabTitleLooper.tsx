"use client";
import { useEffect, useRef } from "react";

const LOOP_MESSAGES = [
    "👀",
    "There's more to see here",
];

export default function TabTitleLooper() {
    const originalTitle = useRef<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        originalTitle.current = document.title;

        const handleVisibilityChange = () => {
            setTimeout(() => {
                if (document.hidden) {
                originalTitle.current = document.title;

                let i = 0;
                document.title = LOOP_MESSAGES[0];

                intervalRef.current = setInterval(() => {
                    i = (i + 1) % LOOP_MESSAGES.length;
                    document.title = LOOP_MESSAGES[i];
                }, 3000);
            } else {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                document.title = originalTitle.current;
            }
            }, 100);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return null;
}
