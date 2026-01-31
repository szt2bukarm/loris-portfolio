"use client"
import WorksFreestyleView from "@/components/Works/WorksFreestyle/WorksFreestyleView";
import WorksGridFilter from "@/components/Works/WorksGrid/WorksGridFilter";
import WorksGridView from "@/components/Works/WorksGrid/WorksGridView";
import WorksList from "@/components/Works/WorksList/WorksList";
import WorksListGlass from "@/components/Works/WorksList/WorksListGlass";
import WorksListView from "@/components/Works/WorksList/WorksListView";
import WorksNav from "@/components/Works/WorksNav";
import WorksShader from "@/components/Works/WorksShader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState, useEffect } from "react";
import ProjectModal from "@/components/Works/ProjectModal";
import { useLenis } from "@studio-freight/react-lenis";
import projects from "@/app/data/projects";

export default function page({ params }: { params: { slug?: string[] } }) {
    const [viewStyle, setViewStyle] = useState("list");
    const [hasPlayed, setHasPlayed] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string[]>(["All"]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const lenis = useLenis();

    useEffect(() => {
        if (isModalOpen) {
            lenis?.stop();
        } else {
            lenis?.start();
        }
    }, [isModalOpen, lenis]);

    // Handle initial load from URL
    useEffect(() => {
        if (params.slug && params.slug.length > 0) {
            const slug = params.slug[0];
            const projectExists = projects.find(p => p.slug === slug);

            if (projectExists) {
                setSelectedProject(slug);
                setIsModalOpen(true);
            } else {
                // Invalid slug - redirect to home
                window.location.href = "/";
            }
        }
    }, [params.slug]);

    // Handle back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path === "/works") {
                setIsModalOpen(false);
            } else if (path.startsWith("/works/")) {
                const slug = path.split("/works/")[1];
                setSelectedProject(slug);
                setIsModalOpen(true);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const handleProjectSelect = (slug: string) => {
        window.history.pushState(null, "", `/works/${slug}`);
        setSelectedProject(slug);
        setIsModalOpen(true);
    };

    const handleModalCloseRequest = () => {
        window.history.pushState(null, "", "/works");
        setIsModalOpen(false);
    };

    const handleAnimationComplete = () => {
        if (!isModalOpen) {
            setSelectedProject(null);
        }
    };


    useGSAP(() => {
        gsap.to("[data-gsap='works-dots'], [data-gsap='works-nav']", {
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            delay: 2.5
        })
        gsap.to("[data-gsap='works-shader']", {
            opacity: 0.35,
            duration: 1,
            ease: "power4.out",
            delay: 2.5
        })

        // [NEW] Handle view enter animations here to prevent flash
        if (viewStyle === "list") {
            gsap.fromTo("[data-gsap='works-list-wrapper']", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power3.out" });
        } else if (viewStyle === "grid") {
            gsap.fromTo("[data-gsap='works-grid-wrapper']", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power3.out" });
        } else if (viewStyle === "freestyle") {
            gsap.fromTo("[data-gsap='works-freestyle-wrapper']", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power3.out" });
        }
    }, [viewStyle])

    return (
        <main className={`w-full h-full min-h-[100dvh] bg-black relative`}>
            <img data-gsap="works-dots" className="opacity-0 fixed z-0 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[5000px] h-[5000px] pointer-events-none" src="/dots.svg" />
            <WorksNav viewStyle={viewStyle} setViewStyle={setViewStyle} />
            <WorksShader />

            {/* List View - Persisted */}
            <div className={`w-full h-full overflow-hidden ${viewStyle === "list" ? "block opacity-100" : "hidden opacity-0"}`} data-gsap="works-list-wrapper">
                <WorksListView
                    setHasPlayed={setHasPlayed}
                    hasPlayed={hasPlayed}
                    onSelect={handleProjectSelect}
                    paused={isModalOpen}
                    active={viewStyle === "list"}
                />
            </div>

            {/* Grid View - Persisted */}
            <div className={`relative w-full h-full ${viewStyle === "grid" ? "block opacity-100" : "hidden opacity-0"}`} data-gsap="works-grid-wrapper">
                <WorksGridFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                <WorksGridView onSelect={handleProjectSelect} activeCategory={activeCategory} active={viewStyle === "grid"} />
            </div>

            {/* Freestyle View - Persisted */}
            <div data-gsap="works-freestyle-wrapper" className={`w-full h-full pt-[150px] sm:pt-[170px] lg:pt-[200px] px-[20px] lg:px-[50px] ${viewStyle === "freestyle" ? "block opacity-100" : "hidden opacity-0"}`}>
                <WorksFreestyleView onSelect={handleProjectSelect} active={viewStyle === "freestyle"} />
            </div>


            {selectedProject && (
                <ProjectModal
                    slug={selectedProject}
                    isOpen={isModalOpen}
                    onClose={handleModalCloseRequest}
                    onAnimationComplete={handleAnimationComplete}
                />
            )}

            <div className={`fixed top-0 left-0 w-screen h-[100dvh] backdrop-blur-[5px] z-[195] pointer-events-none bg-[#36363670] transition-opacity duration-300 ${isModalOpen ? "opacity-100" : "opacity-0"}`}></div>
        </main>
    );
}
