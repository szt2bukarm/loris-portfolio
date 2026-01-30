"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ReactLenis } from "@studio-freight/react-lenis";
import projects from "@/app/data/projects";
import CategoryTag from "../Common/CategoryTag";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorksSocials } from "./WorksSocials";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { useStore } from "@/app/useStore";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

interface Props {
    slug: string;
    onClose: () => void;
    isOpen: boolean;
    onAnimationComplete: () => void;
}

export default function ProjectModal({ slug, onClose, isOpen, onAnimationComplete }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const project = projects.find((p) => p.slug === slug);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { openContact } = useStore();
    const [progressValue, setProgressValue] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const loadedImagesCount = useRef(0);
    const totalImages = project ? project.projectImagesStructure?.reduce((acc, curr) => acc + curr.images.length, 0) || 0 : 0;

    useEffect(() => {
        if (videoRef.current) {
            if (openContact) {
                videoRef.current.pause();
            } else if (isOpen) {
                videoRef.current.play().catch(() => { });
            }
        }
    }, [openContact, isOpen]);

    useEffect(() => {
        if (!project) return;
        // Always set layout ready after a brief delay to allow initial DOM paint
        // We no longer wait for all images because loading="lazy" would cause a deadlock
        const t = setTimeout(() => {
            setIsLayoutReady(true);
        }, 100);

        return () => clearTimeout(t);
    }, [project]);

    // Debounce resize/load refreshes to avoid thrashing
    const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleImageLoad = () => {
        if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
        refreshTimeout.current = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    };


    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [])

    useGSAP(() => {
        const isDesktop = window.innerWidth >= 1024;
        const targetWidth = isDesktop ? "75vw" : "100vw";

        gsap.set(contentRef.current, { width: targetWidth })
    }, [windowWidth])

    useEffect(() => {
        if (!modalRef.current || !contentRef.current) return;

        if (isOpen) {
            const isDesktop = window.innerWidth >= 1024;
            const targetWidth = isDesktop ? "75vw" : "100vw";
            gsap.set("[data-gsap='close-btn']", { opacity: 0 })
            gsap.set(modalRef.current, { opacity: 0 })
            gsap.set(contentRef.current, { width: "0vw", opacity: 0, x: 0 })
            gsap.to(modalRef.current, {
                opacity: 1,
                duration: 0.1,
                ease: "linear",
            })
            gsap.fromTo(contentRef.current, { width: "0vw" }, {
                width: targetWidth,
                duration: isDesktop ? 0.8 : 0.5,
                x: 0,
                ease: "genyo",
                delay: 0.1,
                onComplete: () => {
                    gsap.to("[data-gsap='close-btn'], [data-gsap='works-socials']", {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power4.out",
                    })
                },
                onStart: () => {
                    gsap.set(contentRef.current, { opacity: 1 })
                }
            })
        } else {
            gsap.killTweensOf([modalRef.current, contentRef.current, "[data-gsap='close-btn']"]);

            ScrollTrigger.getAll().forEach(st => {
                if (st.vars.scroller === "[data-gsap='works-modal-scroll']") {
                    st.kill();
                }
            });
            gsap.to("[data-gsap='close-btn'], [data-gsap='works-socials']", {
                opacity: 0,
                duration: 0.3,
                ease: "power4.out",
            })
            gsap.to(modalRef.current, {
                opacity: 0,
                duration: 0.15,
                delay: 0.5,
                ease: "linear",
                onComplete: () => {
                    onAnimationComplete();
                    setIsLayoutReady(false);
                    loadedImagesCount.current = 0;
                }
            })
            gsap.to(contentRef.current, {
                width: "0vw",
                duration: 0.3,
                ease: "power2.in",
            })
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const progressTriggerRef = useRef<ScrollTrigger | null>(null);

    useGSAP(() => {
        if (!isLayoutReady) return;

        const timeout = setTimeout(() => {
            requestAnimationFrame(() => {
                // Force refresh to ensure coordinates are correct after images load
                ScrollTrigger.refresh();

                progressTriggerRef.current = ScrollTrigger.create({
                    trigger: "[data-gsap='works-modal-content']",
                    scroller: "[data-gsap='works-modal-scroll']",
                    start: "top top",
                    end: "bottom-=300 bottom-=200",
                    onUpdate: (self) => {
                        const progress = self.progress * 100;
                        // console.log(progress);
                        setProgressValue(progress);
                    }
                });
            });
        }, 100);

        return () => {
            clearTimeout(timeout);
            progressTriggerRef.current?.kill();
            progressTriggerRef.current = null;
        };
    }, [isLayoutReady]);

    useLayoutEffect(() => {
        if (!isOpen || !isLayoutReady || !imagesRef.current) return;

        const triggers: ScrollTrigger[] = [];
        const timeout = setTimeout(() => {
            requestAnimationFrame(() => {
                imagesRef.current.forEach((image) => {
                    if (!image) return;
                    gsap.set(image, { opacity: 0 });
                    const st = ScrollTrigger.create({
                        trigger: image,
                        scroller: "[data-gsap='works-modal-scroll']",
                        start: "top+=200 bottom",
                        end: "bottom bottom",
                        onEnter: () => {
                            gsap.to(image, {
                                opacity: 1,
                                duration: 0.5,
                                ease: "power4.out",
                            });
                        },
                    });
                    triggers.push(st);
                });
            });
        }, 100);

        return () => {
            clearTimeout(timeout);
            triggers.forEach(st => st.kill());
        };
    }, [isOpen, isLayoutReady, imagesRef]);

    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        if (!isLayoutReady) return;

        let split: SplitText;
        let animationFrame: number;

        if (descriptionRef.current && project && !descriptionRef.current.innerHTML) {
            descriptionRef.current.innerHTML = project.description;
        }

        const runSplit = () => {
            if (!descriptionRef.current) return;

            if (split) split.revert();

            split = new SplitText(descriptionRef.current, { type: "lines" });

            // Wrap lines for overflow hidden reveal effect
            split.lines.forEach((line) => {
                const wrapper = document.createElement("div");
                wrapper.className = "overflow-hidden";
                line.parentNode?.insertBefore(wrapper, line);
                wrapper.appendChild(line);
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: descriptionRef.current,
                    scroller: "[data-gsap='works-modal-scroll']",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.from(split.lines, {
                yPercent: 150,
                duration: 1.2,
                ease: "out",
                stagger: 0.05,
                onComplete: () => {
                    if (project?.website) {
                        gsap.to("[data-gsap='project-website']", {
                            opacity: 1,
                            duration: 0.5,
                            ease: "power4.out",
                        })
                    }
                }
            });
        };

        // Schedule the split to run in the next animation frame to allow layout settling
        animationFrame = requestAnimationFrame(runSplit);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (split) split.revert();
            // Note: GSAP context automatically kills timelines/triggers created inside
        };

    }, [isLayoutReady, project, windowWidth]);

    useGSAP(() => {
        gsap.from("[data-gsap='project-title']", {
            y: 80,
            duration: 0.7,
            ease: "out",
        })

        gsap.from("[data-gsap='project-category'], [data-gsap='project-year']", {
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.3,
            ease: "power4.out",
        })
    }, [])


    if (!project) return null;

    let globalImageIndex = 0;

    return (
        <div
            ref={modalRef}
            className={`fixed inset-0 z-[200] bg-black/50 flex items-end lg:items-center justify-center lg:justify-end opacity-100 ${openContact ? "pointer-events-none" : "pointer-events-auto"}`}
            onClick={onClose}
            style={{ viewTransitionName: "project-modal" } as React.CSSProperties}
        >
            <div
                ref={contentRef}
                className={`relative w-[0vw] opacity-0 h-[100dvh] sm:h-[90dvh] lg:h-[98dvh] bg-gradient-to-b sm:rounded-t-[19px] lg:rounded-[19px] sm:from-[#292929] sm:to-[#4D4D4D] sm:p-[1px] sm:mx-[10px] lg:mr-[10px] flex justify-center items-center overflow-visible sm:translate-y-[1px] lg:translate-y-0`}>

                <button data-gsap="close-btn" onClick={onClose} className="absolute top-[30px] right-[10px] sm:right-[30px] sm:top-[-25px] lg:top-[100px] lg:left-[-25px] w-[50px] h-[50px] rounded-full bg-white/[0.1] backdrop-blur-[10px] border border-[#494949] z-10 flex items-center justify-center hover:brightness-200 transition-[filter] duration-300 cursor-pointer">
                    <img src="/icons/close.svg" alt="close" />
                </button>

                {/* socials */}
                {isLayoutReady && <WorksSocials progressValue={progressValue} onBack={onClose} behance={project.behance} />}

                <div className="relative w-full h-full overflow-hidden sm:rounded-[18px] lg:rounded-[19px] flex justify-center items-center">
                    <div
                        className="relative min-w-[calc(100vw-20px)] lg:min-w-[75vw] w-[100vw] sm:w-[calc(100vw-20px)] lg:w-[75vw] shrink-0 h-[100dvh] sm:h-[90dvh] lg:h-[98dvh] p-[1px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ReactLenis options={{ duration: 1, lerp: 0.1 }} className="w-full h-full bg-black overflow-y-auto sm:rounded-t-[18px] lg:rounded-[19px]" data-gsap="works-modal-scroll" >
                            <div className="w-full pb-[150px]" data-gsap="works-modal-content">

                                {/* banner */}
                                <div className="relative w-full h-[330px] md:h-[500px] flex items-end justify-center ">
                                    <div className="z-0 absolute top-0 left-0 w-full h-[300px] md:h-[500px]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 45%, transparent 85%)' }}>
                                        {project.bannerType == "image" && (
                                            <img
                                                src={project.banner}
                                                className="min-w-full h-full object-cover object-[50%_60%] will-change-auto"
                                                /* @ts-ignore */
                                                fetchpriority="high"
                                                decoding="async"
                                            />
                                        )}
                                        {project.bannerType == "video" && (
                                            <video ref={videoRef} playsInline muted loop src={project.banner} className="min-w-full h-full object-cover object-[50%_60%]" autoPlay />
                                        )}
                                    </div>
                                    <div className="z-10 flex flex-col items-center">
                                        <div className="w-full h-full overflow-hidden">
                                            <p data-gsap="project-title" className="text-[5vw] sm:text-h2 lg:text-h1 leading-[130%] font-intranet text-brightgray mb-[10px] px-[20px] text-center">{project.title}</p>
                                        </div>

                                        <div className="flex gap-[3px] mb-[20px]">
                                            {project.category.map((cat, index) => {
                                                return (
                                                    <div data-gsap="project-category" className="w-fit h-full">
                                                        <CategoryTag key={index} category={cat.category} icon={cat.icon} />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <p data-gsap="project-year" className="text-md leading-[18px] font-ppregular text-brightgray">{project.year}</p>
                                    </div>
                                </div>

                                <div className="pt-[70px] pb-[110px] w-full sm:w-[501px] mx-auto">
                                    <p ref={descriptionRef} data-gsap="project-description" className="font-ppregular text-white text-md leading-md px-[30px] sm:px-0"></p>
                                </div>

                                {project.website && (
                                    <div data-gsap="project-website" className="opacity-0 mb-[100px] w-full flex justify-center">
                                        <a href={project.website} target="_blank" rel="noopener noreferrer" className="relative inline-block px-6 py-4 hover:px-8 transition-all duration-150 text-white group -mt-4 [@media(max-height:750px)]:mt-0">
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FBFBFB80] rounded-tl-[14px]"></div>
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FBFBFB80] rounded-tr-[14px]"></div>
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FBFBFB80] rounded-bl-[14px]"></div>
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FBFBFB80] rounded-br-[14px]"></div>

                                            <span className="text-sm font-ppregular">Live Project</span>
                                        </a>
                                    </div>
                                )}

                                <div className="px-[10px] sm:px-[20px] md:px-[30px] flex flex-col gap-[10px]">
                                    {project.projectImagesStructure?.map((structure, index) => {
                                        return (
                                            <div key={index} className="w-full h-full">
                                                <div style={{ gridTemplateColumns: `repeat(${windowWidth < 724 ? (structure.mobileGrid || structure.grid) : structure.grid}, 1fr)` }} className={`w-full h-full grid gap-[10px]`}>
                                                    {structure.images.map((image, i) => {
                                                        const currentIndex = globalImageIndex++;
                                                        return (
                                                            <img
                                                                ref={el => { if (el && imagesRef.current) imagesRef.current[currentIndex] = el }}
                                                                key={i}
                                                                src={image}
                                                                className={`opacity-0 w-full h-full object-cover`}
                                                                style={{ borderRadius: `${structure.round}px` }}
                                                                onLoad={handleImageLoad}
                                                                loading="lazy"
                                                                decoding="async"
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </ReactLenis>
                    </div>
                </div>
            </div>
        </div>
    );
}
