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
        if (totalImages === 0) {
            setIsLayoutReady(true);
        } else {
            // Reset if project changes (though modal likely unmounts)
            loadedImagesCount.current = 0;
            setIsLayoutReady(false);
        }
    }, [project, totalImages]);

    const handleImageLoad = () => {
        loadedImagesCount.current++;
        if (loadedImagesCount.current >= totalImages) {
            // Small delay to ensure layout paint
            setTimeout(() => setIsLayoutReady(true), 100);
        }
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

            gsap.set(modalRef.current, { opacity: 0 })
            gsap.set(contentRef.current, { width: "0vw", opacity: 1, x: 0 })
            gsap.to(modalRef.current, {
                opacity: 1,
                duration: 0.15,
                ease: "linear",
            })
            gsap.to(contentRef.current, {
                width: targetWidth,
                opacity: 1,
                duration: isDesktop ? 0.8 : 0.5,
                x: 0,
                ease: "genyo",
            })
        } else {
            gsap.to(modalRef.current, {
                opacity: 0,
                duration: 0.15,
                ease: "linear",
                onComplete: () => {
                    onAnimationComplete();
                    setIsLayoutReady(false); // Reset on close
                    loadedImagesCount.current = 0;
                }
            })
            gsap.to(contentRef.current, {
                opacity: 0,
                width: "0vw",
                duration: 2,
                ease: "genyo",
            })
        }

        return () => {
        };
    }, [isOpen]);

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
        if (!imagesRef.current) return;
        setTimeout(() => {
            requestAnimationFrame(() => {
                imagesRef.current.forEach((image) => {
                    gsap.set(image, { opacity: 0 })
                    ScrollTrigger.create({
                        trigger: image,
                        scroller: "[data-gsap='works-modal-scroll']",
                        start: "top+=200 bottom",
                        end: "bottom bottom",
                        onEnter: () => {
                            gsap.to(image, {
                                opacity: 1,
                                duration: 0.5,
                                ease: "power4.out",
                            })
                        },
                    }
                    )
                })
            })
        }, 100);
    }, [isOpen, imagesRef])

    useGSAP(() => {
        const descSplit = new SplitText("[data-gsap='project-description']", { type: "lines" });
        descSplit.lines.forEach((line) => {
            const wrapper = document.createElement("div");
            wrapper.className = "overflow-hidden";
            line.parentNode?.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        })

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

        gsap.from(descSplit.lines, {
            y: 130,
            stagger: 0.1,
            duration: 1.5,
            ease: "out",
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
                className={`relative max-w-[100vw] lg:max-w-[75vw] h-[100dvh] sm:h-[90dvh] lg:h-[98dvh] bg-gradient-to-b sm:rounded-t-[19px] lg:rounded-[19px] sm:from-[#292929] sm:to-[#4D4D4D] sm:p-[1px] sm:mx-[10px] lg:mr-[10px] flex justify-center items-center overflow-visible sm:translate-y-[1px] lg:translate-y-0`}>

                <button onClick={onClose} className="absolute top-[30px] right-[10px] sm:right-[30px] sm:top-[-25px] lg:top-[100px] lg:left-[-25px] w-[50px] h-[50px] rounded-full bg-white/[0.1] backdrop-blur-[10px] border border-[#494949] z-10 flex items-center justify-center hover:brightness-200 transition-[filter] duration-300 cursor-pointer">
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
                                            <img src={project.banner} className="min-w-full h-full object-cover object-[50%_60%] will-change-auto" />
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

                                <div className="pt-[70px] pb-[110px] w-full md:w-[500px] mx-auto">
                                    <p data-gsap="project-description" className="font-ppregular text-white text-md leading-md px-[40px]">{project.description}</p>
                                </div>

                                <div className="px-[10px] sm:px-[20px] md:px-[30px] flex flex-col gap-[10px]">
                                    {project.projectImagesStructure?.map((structure, index) => {
                                        return (
                                            <div key={index} className="w-full h-full">
                                                <div style={{ gridTemplateColumns: `repeat(${windowWidth < 724 ? (structure.mobileGrid || structure.grid) : structure.grid}, 1fr)` }} className={`w-full h-full grid gap-[10px]`}>
                                                    {structure.images.map((image, i) => {
                                                        const currentIndex = globalImageIndex++;
                                                        return (
                                                            <img ref={el => { if (el && imagesRef.current) imagesRef.current[currentIndex] = el }} key={i} src={image} className={`opacity-0 w-full h-full object-cover`} style={{ borderRadius: `${structure.round}px` }} onLoad={handleImageLoad} />
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
