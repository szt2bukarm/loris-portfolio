
import projects from "@/app/data/projects"
import WorksGridItem from "./WorksGridItem"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
gsap.registerPlugin(ScrollTrigger);

interface Props {
    onSelect: (slug: string) => void;
    activeCategory: string[];
    active?: boolean;
}

export default function WorksGridView({ onSelect, activeCategory, active }: Props) {

    useEffect(() => {
        if (active) {
            // Give layout a moment to settle
            setTimeout(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                })
            }, 1);
        }
    }, [active]);

    useGSAP(() => {
        let topTrigger = ScrollTrigger.create({
            trigger: "[data-gsap='works-grid']",
            start: "top top",
            end: "top+=500 top",
            scrub: true,
            animation: gsap.fromTo("[data-gsap='works-grid-top']", { opacity: 0 }, { opacity: 1, ease: "linear" })
        })

        let bottomTrigger = ScrollTrigger.create({
            trigger: "[data-gsap='works-grid']",
            start: "bottom-=500 bottom",
            end: "bottom bottom",
            scrub: true,
            animation: gsap.fromTo("[data-gsap='works-grid-bottom']", { opacity: 1 }, { opacity: 0, ease: "linear" })
        })

    }, [])

    useGSAP(() => {
        if (!active) return;

        const gridItems = document.querySelectorAll('[data-gsap="grid-item"]');

        // Kill previous tweens to prevent conflicts
        gsap.killTweensOf(gridItems);

        gsap.fromTo(gridItems,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.5,
                stagger: {
                    amount: 0.1,
                    grid: "auto",
                    from: "start"
                },
                ease: "power3.out"
            }
        )
    }, [activeCategory, active]);

    return (
        <div data-gsap="works-grid" className="relative  w-full h-full ">
            <div data-gsap="works-grid-top" className="fixed top-0 left-0 w-screen h-[25vh] bg-gradient-to-b from-black to-transparent z-[2] pointer-events-none"></div>
            <div data-gsap="works-grid-bottom" className="fixed bottom-0 left-0 w-screen h-[25vh] bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[10px] w-full min-h-screen pt-[200px] pb-[80px] px-[10px] sm:px-[20px] lg:px-[50px]" >
                {projects.filter((project) => {
                    if (activeCategory.includes("All")) return true;
                    return project.category.some((cat: any) => activeCategory.includes(cat.category));
                }).map((project, index) => {
                    return (
                        <WorksGridItem
                            key={project.slug}
                            thumbnail={project.gridThumbnail}
                            title={project.title}
                            year={project.year}
                            authors={project.authors}
                            theme={project.theme}
                            category={project.category}
                            slug={project.slug}
                            onSelect={onSelect}
                        />
                    )
                })}
            </div>

        </div>
    )
}