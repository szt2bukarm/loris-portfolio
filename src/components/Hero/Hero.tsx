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
    const { isMobile } = useStore();
    const titleRef = useRef<HTMLParagraphElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const splitRef = useRef<SplitText | null>(null);
    const lastWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);

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
        setTimeout(() => {
            splitHeroText();
        }, 2500);
        setTimeout(() => {
            setTriggerAnimation(true);
        }, 2000);

        const handleResize = () => {
            const currentWidth = window.innerWidth;
            if (currentWidth === lastWidthRef.current) return;

            lastWidthRef.current = currentWidth;
            setTimeout(() => {
                splitHeroText();
            }, 100);
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

                // Mobile/Tablet (below xl) - Enforce -100px static offset without animation
                mm.add("(max-width: 1279px)", () => {
                    gsap.set(keychainRef.current, { y: "-100px" });
                });

                // Mobile (below sm) - Enforce -400px static offset without animation
                mm.add("(max-width: 639px)", () => {
                    gsap.set(containerRef.current, { y: "-400px" });
                });
            })
        }, 100);
    }, [])


    return (
        <div ref={heroRef} className="w-screen h-[100dvh] relative overflow-hidden">

            <div className="absolute w-full h-[100vh] bottom-0 left-0 bg-gradient-to-b from-transparent to-black z-[1]" />

            <div
                ref={containerRef}
                className="absolute top-1/2 left-1/2 origin-center overflow-hidden -translate-x-1/2 
                           w-[1056px] h-[594px] -translate-y-[400px] 
                           sm:w-[1344px] sm:h-[756px] sm:translate-y-[-55%]
                           md:w-[1920px] md:h-[1080px]
                           xl:w-[2208px] xl:h-[1242px]
                           "
            >
                <UnicornScene jsonFilePath="/herogenyo.json" width="100%" height="100%" dpi={isMobile ? 1 : 0.5} />
            </div>


            {/* text */}
            <div className="!z-[5] absolute bottom-3 md:bottom-10 lg:bottom-20 left-[10px] md:left-[20px] lg:left-[50px] flex flex-col gap-[20px] w-[calc(100%-20px)] lg:w-[500px] 2xl:w-[633px] ">
                <p ref={subtitleRef} className="opacity-0 text-sm sm:text-lg text-midgray font-ppsemibold">Lorisbukvic.graphics</p>
                <p ref={titleRef} className="opacity-0 text-[20px] md:text-h2 2xl:text-h1 font-intranet text-brightgray leading-[1.3]">Bukvic Loris is a cook turned multimedia designer focusing on web experiences, and stuff that looks good.</p>
            </div>

            <div ref={keychainRef} className="z-[10] relative w-full h-full translate-y-[-100px] xl:translate-y-[0px] overflow-hidden">
                {triggerAnimation && <PhysicsKeychain modelPath="/keychain.glb" />}
            </div>
        </div>
    )
}