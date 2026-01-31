'use client';
import { useEffect, useRef, useState } from "react";
import UnicornScene from "unicornstudio-react";
import PhysicsKeychain from "../PhysicsKeychain";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/app/useStore";
gsap.registerPlugin(SplitText);

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [triggerAnimation, setTriggerAnimation] = useState(false);
    const titleRef = useRef<HTMLParagraphElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const splitRef = useRef<SplitText | null>(null);
    const [containerSize, setContainerSize] = useState<{ w: number, h: number } | null>(null);
    const lastBreakpointRef = useRef<string>("");
    const lastHeightBreakpointRef = useRef<string>("");
    const lastWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);

    const getBreakpoint = (w: number) => {
        if (w >= 1280) return 'xl';
        if (w >= 768) return 'md';
        if (w >= 640) return 'sm';
        return 'base';
    };

    const getHeightBreakpoint = (h: number) => {
        if (h < 500) return 'xs';
        if (h < 900) return 'sm';
        if (h > 1250) return 'lg';
        return 'base';
    };

    const updateDimensions = () => {
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            const h = window.innerHeight;

            let targetW = 1056;
            let targetH = 594;

            if (w >= 1280) { // xl
                targetW = 2208; targetH = 1242;
            } else if (w >= 768) { // md
                targetW = 1920; targetH = 1080;
            } else if (w >= 640) { // sm
                targetW = 1344; targetH = 756;
            }

            // Height-based scaling options
            let heightScale = 1;

            if (h < 500) {
                heightScale = 0.5;
            }

            if (h >= 500 && h < 900) {
                heightScale = 0.8;
            }

            if (h >= 900 && h < 1400) {
                heightScale = 1;
            }

            if (h >= 1250 && h < 1500) {
                heightScale = 1.3;
            }

            if (h >= 1500 && h < 1700) {
                heightScale = 1.5;
            }

            if (h >= 1700 && h < 1900) {
                heightScale = 1.7;
            }

            if (h >= 1900) {
                heightScale = 1.9;
            }

            targetW *= heightScale;
            targetH *= heightScale;

            setContainerSize({ w: Math.round(targetW), h: Math.round(targetH) });
        }
    }

    const splitHeroText = () => {
        if (titleRef.current && subtitleRef.current) {
            // Split title
            if (splitRef.current) {
                splitRef.current.revert();
            }

            const splitTitle = new SplitText(titleRef.current, {
                type: "lines",
            });
            splitRef.current = splitTitle;

            // Wrap each line in a mask div
            splitTitle.lines.forEach((line: HTMLElement) => {
                const wrapper = document.createElement("div");
                wrapper.style.overflow = "hidden";
                if (line.parentNode) {
                    line.parentNode.insertBefore(wrapper, line);
                    wrapper.appendChild(line);
                }
            });

            // Animate title lines
            gsap.fromTo(splitTitle.lines,
                {
                    yPercent: 100,
                },
                {
                    yPercent: 0,
                    ease: "power4.out",
                    stagger: 0.09,
                    duration: 1.2,
                    onStart: () => {
                        gsap.set(titleRef.current, {
                            opacity: 1,
                        })
                    }
                })
            gsap.fromTo(subtitleRef.current, {
                duration: 1,
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                ease: "power3.out",
            });

            return () => {
                splitTitle.revert();
            };
        }
    }

    useEffect(() => {
        // Initialize breakpoint refs
        lastBreakpointRef.current = getBreakpoint(window.innerWidth);
        lastHeightBreakpointRef.current = getHeightBreakpoint(window.innerHeight);

        updateDimensions(); 

        // Run animation once on mount
        setTimeout(() => {
            splitHeroText();
        }, 2500);
        setTimeout(() => {
            setTriggerAnimation(true);
        }, 2000);

        const handleResize = () => {
            updateDimensions();
            if (window.innerWidth !== lastWidthRef.current) {
                lastWidthRef.current = window.innerWidth;
                setTimeout(() => {
                    splitHeroText();
                }, 100);
            }

            // Check for WIDTH breakpoint change
            const currentBreakpoint = getBreakpoint(window.innerWidth);
            if (currentBreakpoint !== lastBreakpointRef.current) {
                lastBreakpointRef.current = currentBreakpoint;
                window.location.reload();
                return;
            }

            // Check for HEIGHT breakpoint change
            const currentHeightBreakpoint = getHeightBreakpoint(window.innerHeight);
            if (currentHeightBreakpoint !== lastHeightBreakpointRef.current) {
                lastHeightBreakpointRef.current = currentHeightBreakpoint;
                window.location.reload();
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };

    }, [])

    const heroRef = useRef<HTMLDivElement>(null);
    const keychainRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        setTimeout(() => {
            requestAnimationFrame(() => {
                const mm = gsap.matchMedia();

                // Desktop/Tablet (sm and up) - Initial -55%
                mm.add("(min-width: 640px)", () => {
                    ScrollTrigger.create({
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                        animation: gsap.fromTo(containerRef.current, {
                            y: "-55%"
                        }, {
                            y: "-60%"
                        })
                    })
                });

                // Desktop (xl and up) - Initial 0px for keychain
                mm.add("(min-width: 1280px)", () => {
                    ScrollTrigger.create({
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                        animation: gsap.fromTo(keychainRef.current, {
                            y: "0px"
                        }, {
                            y: "-3%"
                        })
                    })
                });

                mm.add("(max-width: 1279px)", () => {
                    gsap.set(keychainRef.current, { y: "-100px" });
                });

                mm.add("(max-width: 639px)", () => {
                    gsap.set(containerRef.current, { y: "-67%" });
                });
            })
        }, 100);
    }, [])


    return (
        <div ref={heroRef} className="w-screen h-[100dvh] relative overflow-hidden">

            <div className="absolute w-full h-[100vh] bottom-0 left-0 bg-gradient-to-b from-transparent to-black z-[1]" />

            <div
                ref={containerRef}
                style={containerSize ? { width: containerSize.w, height: containerSize.h } : {}}
                className="absolute top-1/2 left-1/2 origin-center overflow-hidden -translate-x-1/2 
                           -translate-y-[67%] 
                           sm:translate-y-[-55%]
                           "
            >
                <UnicornScene jsonFilePath="/herogenyo.json" width="100%" height="100%" dpi={window.innerWidth > 1280 ? 0.5 : window.innerWidth > 640 ? 0.75 : 1} />
            </div>


            {/* text */}
            <div className="!z-[5] absolute bottom-3 md:bottom-10 lg:bottom-20 left-[10px] md:left-[20px] lg:left-[50px] flex flex-col gap-[20px] w-[calc(100%-20px)] lg:w-[500px] 2xl:w-[633px] ">
                <p ref={subtitleRef} className="opacity-0 text-sm sm:text-lg text-midgray font-ppsemibold">Lorisbukvic.graphics</p>
                <p ref={titleRef} className="opacity-0 text-[20px] md:text-h2 2xl:text-h1 font-intranet text-brightgray leading-[1.3]">Loris Bukvic is a cook turned multimedia designer focusing on web experiences, and stuff that looks good.</p>
            </div>

            <div ref={keychainRef} className="z-[10] relative w-full h-full translate-y-[-100px] xl:translate-y-[0px] overflow-hidden">
                {triggerAnimation && <PhysicsKeychain modelPath="/keychain.glb" />}
            </div>
        </div>
    )
}