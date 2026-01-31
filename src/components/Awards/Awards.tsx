"use client"
import gsap from "gsap";
import { useState } from "react";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(SplitText, ScrollTrigger);

const data = [
    {
        icon: "/icons/awwwards.svg",
        text: "Site of The Day  |  DAYDREAM PLAYER",
        from: "Awwwards",
        image: "/assets/project_images/awards/daydream.webp",
        link: "https://www.awwwards.com/sites/daydream-player/"
    },
    {
        icon: "/icons/muzli.svg",
        text: "Featured on Muzli Picks  |  DAYDREAM PLAYER",
        from: "Muzli",
        image: "/assets/project_images/awards/muzlihonor.webp",
        link: "https://muz.li/picked/daydream/"
    },
    {
        icon: "/icons/product_design.svg",
        text: "Featured in Product Design",
        from: "Behance",
        image: "/assets/project_images/awards/pd.webp",
        link: "https://www.behance.net/gallery/191232761/LUMI-DST-02/"
    },
    {
        icon: "/icons/3d_art.svg",
        text: "Featured in 3D Art",
        from: "Behance",
        image: "/assets/project_images/awards/3d.webp",
        link: "https://www.behance.net/gallery/191502531/36-DAYS-OF-TYPE-2024/"
    },
    {
        icon: "/icons/ps_category.svg",
        text: "Featured in Photoshop Category",
        from: "Behance",
        image: "/assets/project_images/awards/3d.webp",
        link: "https://www.behance.net/gallery/191502531/36-DAYS-OF-TYPE-2024/"
    },
]

const AwardRow = ({ icon, text, from, link, onMouseEnter }: { icon: string; text: string; from: string; link: string; onMouseEnter: () => void }) => {
    return (
        <div className="hidden sm:flex items-center w-full opacity-50 hover:opacity-100 duration-150 transition-opacity cursor-pointer" onClick={() => window.open(link, "_blank", "noopener noreferrer")} onMouseEnter={onMouseEnter}>
            <div className="min-w-[70px] h-full">
                <img data-gsap="award-icon" src={icon} className="h-full" alt={`${from} logo`} />
            </div>
            <p data-gsap="award-text" className="text-md text-brightgray font-ppsemibold">{text}</p>
            <p data-gsap="award-from" className="text-md text-brightgray font-ppsemibold ml-auto uppercase">{from}</p>
        </div>
    )
}

const AwardRowMobile = ({ icon, text, from, link }: { icon: string; text: string; from: string; link: string }) => {
    return (
        <div className="active:opacity-50 opacity-100 hover:opacity-50 duration-150 transition-opacity cursor-pointer flex sm:hidden items-start w-full" onClick={() => window.open(link, "_blank", "noopener noreferrer")}>
            <div className="min-w-[55px] h-full">
                <img data-gsap="award-icon-mobile" src={icon} className="h-full translate-y-[5px]" alt={`${from} logo`} />
            </div>
            <div className="flex flex-col">
                <p data-gsap="award-from-mobile" className="text-md text-brightgray font-ppsemibold uppercase">{from}</p>
                <p data-gsap="award-text-mobile" className="text-md text-brightgray font-ppsemibold">{text}</p>
            </div>
        </div>
    )
}

const SpawnedImage = ({ src, zIndex, onEnterComplete }: { src: string; zIndex: number; onEnterComplete?: () => void }) => {
    const ref = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Use yPercent: -50 to handle centering via GSAP instead of CSS to avoid matrix overwrites
        tl.fromTo(ref.current,
            { scale: 0, yPercent: -50 },
            { scale: 1, yPercent: -50, duration: 0.75, ease: "power4.inOut", onComplete: onEnterComplete }
        );

    }, []);

    return (
        <img
            ref={ref}
            src={src}
            className="absolute top-1/2 left-0 w-full h-auto rounded-[13px] shadow-lg will-change-transform"
            style={{ zIndex }}
            alt="award image"
        />
    );
};

export default function Awards() {
    const [activeImages, setActiveImages] = useState<{ id: number; src: string }[]>([]);
    const counterRef = useRef(0);
    const lastHoveredRef = useRef<number | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const xTo = useRef<gsap.QuickToFunc>();
    const yTo = useRef<gsap.QuickToFunc>();
    const rotationTo = useRef<gsap.QuickToFunc>();
    const containerRef = useRef<HTMLDivElement>(null);
    const exitDelayRef = useRef<gsap.core.Tween | null>(null);

    // Reset last hovered index when all images fade out so they can be re-triggered
    useEffect(() => {
        if (activeImages.length === 0) {
            lastHoveredRef.current = null;
        }
    }, [activeImages]);

    useGSAP(() => {
        if (imageContainerRef.current) {

            // Initialize quickTo functions
            xTo.current = gsap.quickTo(imageContainerRef.current, "x", { duration: 0.8, ease: "power3.out" });
            yTo.current = gsap.quickTo(imageContainerRef.current, "y", { duration: 0.8, ease: "power3.out" });
            rotationTo.current = gsap.quickTo(imageContainerRef.current, "rotationX", { duration: 0.8, ease: "power3.out" });

            // Using matchMedia for responsive logic (scaling & initial position)
            const mm = gsap.matchMedia();

            mm.add("(min-width: 1280px)", () => {
                // Desktop
                gsap.set(imageContainerRef.current, { scale: 1, xPercent: -50, yPercent: -50 });
                // Set initial position immediately to prevent slide from center
                if (xTo.current && yTo.current) {
                    xTo.current(window.innerWidth * 0.12);
                    yTo.current(0);
                }
            });

            mm.add("(max-width: 1279px)", () => {
                // Mobile
                gsap.set(imageContainerRef.current, { scale: 0.75, xPercent: -50, yPercent: -50 });
                if (xTo.current && yTo.current) {
                    xTo.current(0);
                    yTo.current(0);
                }
            });

        }
    }, []);

    const handleHover = (index: number) => {
        if (lastHoveredRef.current === index) return;
        lastHoveredRef.current = index;

        const imageSrc = data[index].image;
        if (!imageSrc) return;

        setActiveImages((prev) => {
            const newImage = {
                id: counterRef.current++,
                src: imageSrc
            };
            // Limit to last 20 images
            const newList = [...prev, newImage];
            if (newList.length > 20) {
                return newList.slice(newList.length - 20);
            }
            return newList;
        });
    };

    const handleEnterComplete = (completedId: number) => {
        setActiveImages((prev) => prev.filter((img) => img.id >= completedId));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!yTo.current || !rotationTo.current || !xTo.current) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const offset = mouseY - centerY;

        // Map offset to rotation
        const rotationStrength = 4;
        const normalizedOffset = offset / centerY; // -1 to 1 (approx)
        const rotation = normalizedOffset * rotationStrength * -1; // Inverted direction

        const isDesktop = window.innerWidth >= 1280;

        if (isDesktop) {
            // Fixed horizontal (shifted right to match original), Vertical follow relative to center
            xTo.current(window.innerWidth * 0.12);
            yTo.current(offset);
        } else {
            // Full follow mouse
            xTo.current(mouseX);
            yTo.current(mouseY);
        }

        rotationTo.current(rotation);
    };

    const handleMouseLeave = () => {
        if (!imageContainerRef.current) return;

        gsap.to(imageContainerRef.current.children, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            delay: 1,
            overwrite: "auto"
        });

        exitDelayRef.current = gsap.delayedCall(1.3, () => {
            setActiveImages([]);
            lastHoveredRef.current = null;
        });
    }

    const handleMouseEnter = () => {
        if (exitDelayRef.current) {
            exitDelayRef.current.kill();
            exitDelayRef.current = null;
        }

        if (!imageContainerRef.current) return;
        gsap.killTweensOf(imageContainerRef.current.children);

        // Don't set scale here, let matchMedia handle the container scale. 
        // We only animate opacity and child scale.
        gsap.to(imageContainerRef.current.children, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            overwrite: "auto"
        });
    }

    useGSAP(() => {
        document.fonts.ready.then(() => {
            const splitText = new SplitText("[data-gsap='award-text']", {
                type: "lines",
                linesClass: "line",
                mask: "lines",
            });

            const splitFrom = new SplitText("[data-gsap='award-from']", {
                type: "lines",
                linesClass: "line",
                mask: "lines",
            });

            const splitTextMobile = new SplitText("[data-gsap='award-text-mobile']", {
                type: "lines",
                linesClass: "line",
                mask: "lines",
            });

            const splitFromMobile = new SplitText("[data-gsap='award-from-mobile']", {
                type: "lines",
                linesClass: "line",
                mask: "lines",
            });

            const wrapLines = (lines: HTMLElement[]) => {
                lines.forEach((line) => {
                    const wrapper = document.createElement("div");
                    wrapper.style.overflow = "hidden";
                    line.parentNode?.insertBefore(wrapper, line);
                    wrapper.appendChild(line);
                });
            };

            wrapLines(splitText.lines as HTMLElement[]);
            wrapLines(splitFrom.lines as HTMLElement[]);
            wrapLines(splitTextMobile.lines as HTMLElement[]);
            wrapLines(splitFromMobile.lines as HTMLElement[]);
            gsap.set("[data-gsap='award-icon'], [data-gsap='award-icon-mobile']", {
                opacity: 0,
            })
            gsap.set("[data-gsap='award-text'] .line, [data-gsap='award-from'] .line, [data-gsap='award-text-mobile'] .line, [data-gsap='award-from-mobile'] .line", {
                yPercent: 100,
            })
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top+=200 80%",
                once: true,
                onEnter: () => {
                    gsap.fromTo(
                        "[data-gsap='award-icon']",
                        { opacity: 0, scale: 0.5 },
                        {
                            opacity: 1,
                            scale: 1,
                            stagger: 0.2,
                            duration: 1.2,
                            ease: "back.out(2)",
                        }
                    );

                    gsap.fromTo(
                        "[data-gsap='award-text'] .line",
                        { yPercent: 100, opacity: 0 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.1,
                            duration: 1.2,
                            ease: "out",
                        }
                    );

                    gsap.fromTo(
                        "[data-gsap='award-from'] .line",
                        { yPercent: 100, opacity: 0 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.1,
                            duration: 1.2,
                            ease: "out",
                        }
                    );

                    gsap.fromTo(
                        "[data-gsap='award-icon-mobile']",
                        { opacity: 0, scale: 0.5 },
                        {
                            opacity: 1,
                            scale: 1,
                            stagger: 0.2,
                            duration: 1.2,
                            ease: "back.out(2)",
                        }
                    );

                    gsap.fromTo(
                        "[data-gsap='award-text-mobile'] .line",
                        { yPercent: 100, opacity: 0 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.1,
                            duration: 1.2,
                            ease: "out",
                        }
                    );

                    gsap.fromTo(
                        "[data-gsap='award-from-mobile'] .line",
                        { yPercent: 100, opacity: 0 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.1,
                            duration: 1.2,
                            ease: "out",
                        }
                    );
                },
            });
        });
    }, { scope: containerRef });


    return (
        <section ref={containerRef} className="px-[10px] sm:px-[20px] pt-[90px] lg:px-[50px]  xl:py-[170px]">
            <p className="text-h3 text-midgray font-intranet opacity-80 mb-[50px] leading-[130%]">awards and<br></br>recognitions</p>

            <div className="relative flex flex-col gap-[20px]" style={{ perspective: "1000px" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>
                {/* Rows */}
                {data.map((entry, i) => (
                    <AwardRow key={i} onMouseEnter={() => handleHover(i)} icon={entry.icon} text={entry.text} from={entry.from} link={entry.link} />
                ))}

                {/* Mobile Rows */}
                {data.map((entry, i) => (
                    <AwardRowMobile key={`mobile-${i}`} icon={entry.icon} text={entry.text} from={entry.from} link={entry.link} />
                ))}

                {/* Stacking Image Container */}
                <div ref={imageContainerRef} className="absolute top-0 left-0 xl:top-1/2 xl:left-1/2 w-[40vw] max-w-[700px] rounded-[13px] pointer-events-none z-0" style={{ transformStyle: "preserve-3d" }}>
                    {activeImages.map((img, i) => (
                        <SpawnedImage key={img.id} src={img.src} zIndex={img.id} onEnterComplete={() => handleEnterComplete(img.id)} />
                    ))}
                </div>
            </div>

        </section>
    )
}