"use client"
import { useGSAP } from "@gsap/react";
import WorksList from "./WorksList";
import WorksListGlass from "./WorksListGlass";
import gsap from "gsap";
import WorksShader from "../WorksShader";
import { useEffect, useRef, useState } from "react";

export default function WorksListView({ hasPlayed, setHasPlayed, onSelect, paused, active }: { hasPlayed: boolean, setHasPlayed: (value: boolean) => void, onSelect: (slug: string) => void, paused: boolean, active: boolean }) {
    const [windowWidth, setWindowWidth] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const shouldScale = windowWidth >= 640 && windowWidth < 1024;

    const [glassReady, setGlassReady] = useState(false);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useGSAP(() => {
        gsap.fromTo("[data-gsap='works-list-item']", {
            opacity: 0,
            pointerEvents: "none",
        }, {
            opacity: 1,
            pointerEvents: "all",
            duration: hasPlayed ? 0.5 : 1,
            stagger: hasPlayed ? 0 : 0.03,
            delay: hasPlayed ? 0 : 1.75,
            ease: "power4.out",
        })
    }, [])

    useGSAP(() => {
        if (windowWidth === 0) return;

        if (hasPlayed) {
            if (glassReady) {
                gsap.to("[data-gsap='works-glass']",
                    {
                        opacity: 1,
                        duration: 0.3,
                        overwrite: "auto"
                    }
                )
            } else {
                gsap.set("[data-gsap='works-glass']", { opacity: 0 });
            }
            return;
        }

        if (windowWidth < 724) {
            gsap.delayedCall(2.5, () => setHasPlayed(true));
            return;
        }

        if (windowWidth < 1024) {
            gsap.set("[data-gsap='works-glass']", { xPercent: 0 });
            // Cleanup: Removed explicit width/scale animations here as we handle responsive scaling in 3D now
            gsap.to("[data-gsap='works-glass']", {
                yPercent: -19,
                duration: 1.5,
                delay: 2.2,
                ease: "power4.out",
                onComplete: () => setHasPlayed(true)
            })

        }

        if (windowWidth === 0) return;

        if (windowWidth > 1024) {
            gsap.to("[data-gsap='works-glass']", {
                xPercent: 20,
                duration: 2.5,
                ease: "power4.out",
                delay: 2.5,
                onComplete: () => {
                    setHasPlayed(true);
                }
            })
        }
    }, [glassReady, windowWidth])

    useEffect(() => {
        if (!hasPlayed) return;
        if (windowWidth < 640) {
            gsap.set("[data-gsap='works-glass']", { xPercent: 0, yPercent: 0, scale: 1, overwrite: "auto" });
            gsap.set("[data-gsap='works-glass-canvas']", { width: "100%", xPercent: 0, overwrite: "auto" });
        } else if (windowWidth < 1024) {
            gsap.set("[data-gsap='works-glass']", { xPercent: 0, yPercent: -19, scale: 1, overwrite: "auto" });
            gsap.set("[data-gsap='works-glass-canvas']", { width: "100%", xPercent: 0, overwrite: "auto" });
        } else {
            gsap.set("[data-gsap='works-glass']", { xPercent: 20, yPercent: 0, scale: 1, overwrite: "auto" });
            gsap.set("[data-gsap='works-glass-canvas']", { width: "100%", xPercent: 0, overwrite: "auto" });
        }
    }, [windowWidth, hasPlayed])

    return (
        <div className="w-screen h-[100dvh] relative">
            <div className="block sm:hidden lg:block xl:hidden absolute left-0 top-0 h-[100dvh] w-[100vw] bg-gradient-to-r from-black/80 via-black/60 to-black/80 sm:to-transparent z-[1]"></div>
            <WorksListGlass hoveredIndex={hoveredIndex} hasPlayed={hasPlayed} shouldScale={shouldScale} onReady={() => setGlassReady(true)} paused={paused || !active} />
            <WorksList onSelect={onSelect} paused={paused || !active} onHoverChange={setHoveredIndex} />

        </div>
    )
}