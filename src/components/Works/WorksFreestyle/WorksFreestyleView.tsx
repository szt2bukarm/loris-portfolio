import projects from "@/app/data/projects"
import WorksFreestyleItem from "./WorksFreestyleItem"
import { useState, useMemo, useEffect, useRef } from "react"
import { useStore } from "@/app/useStore"
import { useGSAP } from "@gsap/react";
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

interface Props {
    onSelect: (slug: string) => void;
    active?: boolean;
}

export default function WorksFreestyleView({ onSelect, active }: Props) {
    const [readyToPaint, setReadyToPaint] = useState(false);

    useEffect(() => {
        if (active) {
            // Delay rendering to allow view transition to finish smoothly
            const timer = setTimeout(() => {
                setReadyToPaint(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setReadyToPaint(false);
        }
    }, [active]);

    const isMobile = useStore((state) => state.isMobile);
    const shouldShuffle = useStore((state) => state.shouldShuffle);
    const setShouldShuffle = useStore((state) => state.setShouldShuffle);
    const [hovered, setHovered] = useState(false);
    const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());
    const [nextRevealIndex, setNextRevealIndex] = useState(0);
    const [shuffleKey, setShuffleKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getCols = (width: number) => {
        if (width >= 1536) return 7;
        if (width >= 1280) return 6;
        if (width >= 1024) return 5;
        if (width >= 768) return 4;
        if (width >= 640) return 3;
        return 2;
    };

    const MIN_IMAGES = 25;

    const generateShuffle = () => {
        let allImages: any[] = [];

        projects.forEach((project) => {
            const shuffledImages = [...project.projectImages].sort(() => Math.random() - 0.5);
            const count = (project as any).freestyleImageCount || Math.ceil(shuffledImages.length * 0.7);
            const selectedImages = shuffledImages.slice(0, count);

            selectedImages.forEach((image) => {
                allImages.push({
                    ...project,
                    image: image
                });
            });
        });

        let finalImages = [...allImages];
        while (finalImages.length < MIN_IMAGES && finalImages.length > 0) {
            finalImages = [...finalImages, ...allImages];
        }
        return finalImages.sort(() => Math.random() - 0.5);
    };

    const [shuffledData, setShuffledData] = useState<any[]>([]);

    useEffect(() => {
        setShuffledData(generateShuffle());
    }, []);

    const displayedItems = useMemo(() => {
        if (shuffledData.length === 0) return [];
        const cols = getCols(windowWidth);
        const count = Math.floor(shuffledData.length / cols) * cols;
        return shuffledData.slice(0, count);
    }, [shuffledData, windowWidth]);

    const handleImageLoad = (index: number) => {
        setLoadedIndices(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    };

    useEffect(() => {
        if (loadedIndices.has(nextRevealIndex)) {
            const timeout = setTimeout(() => {
                setNextRevealIndex(prev => prev + 1);
            }, 10);
            return () => clearTimeout(timeout);
        }
    }, [loadedIndices, nextRevealIndex]);

    useEffect(() => {
        if (shouldShuffle) {
            const items = document.querySelectorAll("[data-gsap='works-freestyle-item']");
            const folder = document.querySelector("[data-gsap='folder-button']");

            if (!folder || items.length === 0) {
                setShouldShuffle(false);
                return;
            }

            const folderRect = folder.getBoundingClientRect();
            const folderX = folderRect.left + folderRect.width / 2;
            const folderY = folderRect.top + folderRect.height / 2;

            // Optimize for performance
            gsap.set(items, { willChange: "transform, opacity" });

            const tl = gsap.timeline({
                onComplete: () => {
                    setShuffleKey(prev => prev + 1);
                    setShuffledData(generateShuffle());
                    setLoadedIndices(new Set());
                    setNextRevealIndex(0);
                    setShouldShuffle(false);
                    // Reset positions for new items
                    gsap.set(items, { x: 0, y: 0, scale: 1, opacity: 1, clearProps: "all" });
                }
            });

            items.forEach((item) => {
                const rect = item.getBoundingClientRect();

                // Visibility check - only animate visible items with high fidelity
                const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100;

                if (!isVisible) {
                    // Just fade out off-screen items cheaply
                    tl.to(item, { opacity: 0, duration: 0.3 }, 0);
                    return;
                }

                const itemX = rect.left + rect.width / 2;
                const itemY = rect.top + rect.height / 2;

                const targetX = folderX - itemX;
                const targetY = folderY - itemY;

                // Create a curved path using an intermediate point
                // Swoop slightly inwards/downwards first
                const midX = targetX * 0.4 + (Math.random() - 0.5) * 100;
                const midY = 100 + Math.random() * 50;

                tl.to(item, {
                    motionPath: {
                        path: [
                            { x: 0, y: 0 },
                            { x: 0, y: 100 },
                            { x: midX, y: midY },
                            { x: targetX, y: targetY }
                        ],
                        curviness: 0.5,
                        autoRotate: false
                    },
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power1.inOut"
                }, Math.random() * 0.1);
            });

            tl.to({}, { duration: 0.1 });
        }
    }, [shouldShuffle]);

    useGSAP(() => {
        if (!containerRef.current || !readyToPaint) return;

        let topTrigger = ScrollTrigger.create({
            trigger: "[data-gsap='works-freestyle']",
            start: "top top",
            end: "top+=500 top",
            scrub: true,
            animation: gsap.fromTo("[data-gsap='works-freestyle-top']", { opacity: 0 }, { opacity: 1, ease: "linear" })
        })

        let bottomTrigger = ScrollTrigger.create({
            trigger: "[data-gsap='works-freestyle']",
            start: "bottom-=500 bottom",
            end: "bottom bottom",
            scrub: true,
            animation: gsap.fromTo("[data-gsap='works-freestyle-bottom']", { opacity: 1 }, { opacity: 0, ease: "linear" })
        })
    }, [containerRef, displayedItems, readyToPaint])


    return (
        <div ref={containerRef} className="w-full min-h-full pb-[70px]">
            <div data-gsap="works-freestyle" className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-[10px] ${readyToPaint ? "" : "hidden"}`}>

                <div data-gsap="works-freestyle-top" className="fixed top-0 left-0 w-screen h-[25dvh] bg-gradient-to-b from-black to-transparent z-[2] pointer-events-none"></div>
                <div data-gsap="works-freestyle-bottom" className="fixed bottom-0 left-0 w-screen h-[25dvh] bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none"></div>



                {readyToPaint && displayedItems.map((item, index) => (
                    <WorksFreestyleItem
                        key={`${shuffleKey}-${index}`}
                        index={index}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                        category={item.category}
                        year={item.year}
                        primaryColor={item.primaryColor}
                        setHovered={setHovered}
                        slug={item.slug}
                        onSelect={onSelect}
                        onInternalLoad={() => handleImageLoad(index)}
                        shouldReveal={isMobile ? index < nextRevealIndex : undefined}
                    />
                ))}
            </div>

            <div className={`fixed inset-0 bg-black/75 z-[100] pointer-events-none ${hovered && !isMobile ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}>
            </div>
        </div>
    )
}