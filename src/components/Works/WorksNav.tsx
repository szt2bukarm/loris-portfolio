import { useState } from "react";
import { Link } from "next-view-transitions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@studio-freight/react-lenis";
import FolderButton from "../FolderButton/FolderButton";
import { useStore } from "@/app/useStore";
interface Props {
    viewStyle: string;
    setViewStyle: (viewStyle: string) => void;
}

export default function WorksNav({ viewStyle, setViewStyle }: Props) {
    const { setShouldShuffle } = useStore();
    const lenis = useLenis();

    const [isAnimating, setIsAnimating] = useState(false);

    const changeView = (targetStyle: string) => {
        if (viewStyle === targetStyle || isAnimating) return;
        setIsAnimating(true);
        if (targetStyle !== 'list') {
            lenis?.scrollTo(0, { immediate: false });
        }

        const getSelector = (style: string) => {
            if (style === "list") return "[data-gsap='works-list-wrapper']";
            if (style === "grid") return "[data-gsap='works-grid-wrapper']";
            if (style === "freestyle") return "[data-gsap='works-freestyle-wrapper']";
            return "";
        };

        const currentSelector = getSelector(viewStyle);


        if (!document.querySelector(currentSelector)) {
            setViewStyle(targetStyle);
            setIsAnimating(false);
            return;
        }

        gsap.to(currentSelector, {
            duration: 0.2,
            opacity: 0,
            ease: "power3.out",
            onComplete: () => {
                setViewStyle(targetStyle);
                setTimeout(() => setIsAnimating(false), 200);
            }
        });
    };

    useGSAP(() => {
        if (viewStyle === "freestyle") {
             gsap.to("[data-gsap='nav-display-style']", {
                        opacity: 0,
                        pointerEvents: "none",
                        delay: 0,
                        duration: 0.4,
                        ease: "power2.out"
                    });
            gsap.to("[data-gsap='nav-folder-wrapper']", {
                opacity: 1,
                pointerEvents: "all",
                delay: 0.2,
                duration: 0.4,
                ease: "power2.out"
            });
        } else {
            gsap.to("[data-gsap='nav-display-style']", {
                opacity: 1,
                pointerEvents: "all",
                delay: 0.2,
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to("[data-gsap='nav-folder-wrapper']", {
                opacity: 0,
                pointerEvents: "none",
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }, [viewStyle]);

    return (
        <div data-gsap="works-nav" className="opacity-0 z-[15] fixed top-[90px] lg:top-[100px] w-full flex px-[10px] sm:px-[20px] lg:px-[50px] justify-between items-center">

            {/* breadcrumb */}
            <p className="hidden md:block font-ppsemibold text-brightgray text-md"><Link href={"/"}>Lorisbukvic.graphics</Link><span className="mx-[10px]">/</span><span className="text-white">Works</span></p>

            {/* display style */}
            <div data-gsap="nav-display-style" className="relative md:absolute md:left-1/2 md:translate-x-[-50%] flex gap-[10px] items-center">
                <button className={`${viewStyle === "list" ? "w-full h-full" : "w-full h-full opacity-50 hover:opacity-30"} transition-all duration-150`} onClick={() => changeView("list")}>
                    <img src="/icons/list.svg" className="w-[20px]" />
                </button>
                <button className={`${viewStyle === "grid" ? "w-full h-full" : "w-full h-full opacity-50 hover:opacity-30"} transition-all duration-150`} onClick={() => changeView("grid")}>
                    <img src="/icons/grid.svg" className="w-[24px]" />
                </button>
            </div>
            {/* Always render, animate opacity */}
            <div data-gsap="nav-folder-wrapper" onClick={() => setShouldShuffle(true)} className={`absolute left-[-22px] sm:left-[-15px] md:left-1/2 md:translate-x-[-50%] flex gap-[10px] items-center scale-[0.45] sm:scale-[0.5] lg:scale-[0.75] ${viewStyle === "freestyle" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <FolderButton />
            </div>

            {/* category style */}
            <div className="flex gap-[10px]">
                <button onClick={() => changeView("grid")} className={`text-brightgray font-ppsemibold text-md transition-all duration-300 ${viewStyle === "list" || viewStyle === "grid" ? "text-white" : "hover:opacity-50"}`}>categorized</button>
                <p className="text-brightgray font-ppsemibold text-md">{"/"}</p>
                <button onClick={() => changeView("freestyle")} className={`text-brightgray font-ppsemibold text-md transition-all duration-300 ${viewStyle === "freestyle" ? "text-white" : "hover:opacity-50"}`}>freestyle</button>
            </div>

        </div>
    )
}