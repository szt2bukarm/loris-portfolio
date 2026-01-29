'use client';
import { useEffect, useRef, useState } from "react";
import UnicornScene from "unicornstudio-react";
import PhysicsKeychain from "../PhysicsKeychain";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
gsap.registerPlugin(SplitText);

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [triggerAnimation, setTriggerAnimation] = useState(false);
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

    const [scale, setScale] = useState(1);

    // useEffect(() => {
    //     const handleScale = () => {
    //         const widthScale = window.innerWidth / 1920;
    //         const heightScale = window.innerHeight / 1080;

    //         const newScale = Math.max(widthScale, heightScale);
    //         setScale(newScale);
    //     };

    //     handleScale();
    //     window.addEventListener("resize", handleScale);
    //     return () => window.removeEventListener("resize", handleScale);
    // }, []);

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <div
                ref={containerRef}
                className="absolute top-1/2 left-1/2 origin-center overflow-hidden -translate-x-1/2 
                           w-[1056px] h-[594px] -translate-y-[400px] 
                           sm:w-[1344px] sm:h-[756px] sm:-translate-y-1/2
                           md:w-[1920px] md:h-[1080px]
                           xl:w-[2208px] xl:h-[1242px]"
            >
                <UnicornScene jsonFilePath="/herogenyo.json" width="100%" height="100%" dpi={1} />
            </div>


            {/* text */}
            <div className="!z-[1] absolute bottom-10 md:bottom-20 left-[20px] xl:left-[50px] xl:top-[65vh] xl:-translate-y-1/2 flex flex-col gap-[20px] w-[80%] xl:w-[500px] 2xl:w-[633px]">
                <p ref={subtitleRef} className="opacity-0 text-lg text-midgray font-ppsemibold">Lorisbukvic.graphics</p>
                <p ref={titleRef} className="opacity-0 text-h4 sm:text-h3 md:text-h2 2xl:text-h1 font-intranet text-brightgray leading-[1.3]">Bukvic Loris is a cook turned multimedia designer focusing on web experiences, and stuff that looks good.</p>
            </div>

            <div className="z-[2] relative w-full h-full translate-y-[-100px] xl:translate-y-[0px] overflow-hidden">
                {triggerAnimation && <PhysicsKeychain modelPath="/keychain.glb" />}
            </div>
        </div>
    )
}