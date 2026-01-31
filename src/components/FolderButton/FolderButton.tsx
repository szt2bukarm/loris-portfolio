import { useMemo } from "react";

const workImages = [
    "aughtsspective/thumb.webp",
    "daydream/thumb.webp",
    "daydream_web/thumb.webp",
    "pneuma/thumb.webp",
    "amca/thumb.webp",
    "ikon_web/thumb.webp",
    "loben/thumb.webp",
    "orith/thumb.webp",
    "posterfolio/thumb.webp",
    "36daysoftype/thumb.webp",
    "dailyui/thumb.webp",
    "wayer/thumb.webp",
];

export default function FolderButton({ isExternalHover }: { isExternalHover?: boolean }) {
    const randomImages = useMemo(() => {
        return [...workImages]
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
    }, []);

    const hoverClass = isExternalHover ? "![transform:translateY(2px)]" : "";
    const hoverClassImg1 = isExternalHover ? "![top:-55px]" : "";
    const hoverClassImg2 = isExternalHover ? "![top:-65px]" : "";
    const hoverClassFront = isExternalHover ? "![transform:translateX(-50%)_rotateX(-30deg)]" : "";

    return (
        <div data-gsap="folder-button" className="group relative w-[120px] h-[90px] [perspective:500px] overflow-visible cursor-pointer">
            <img alt="backplate of folder" src="/assets/folder/folder_back.png" className={`w-[120px] h-[90px] object-contain group-hover:translate-y-[2px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${hoverClass}`} />

            <img
                alt="thumbnail of a project"
                src={`/assets/project_images/${randomImages[0]}`}
                className={`absolute top-[-50px] left-[40px] w-full h-full scale-[0.5] rotate-[-70deg] object-cover origin-bottom transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-midgray rounded-[10px] group-hover:top-[-55px] ${hoverClassImg1}`}
            />
            <img
                alt="thumbnail of a project"
                src={`/assets/project_images/${randomImages[1]}`}
                className={`absolute top-[-50px] left-[-40px] w-full h-full scale-[0.55] rotate-[70deg] object-cover origin-bottom transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-midgray rounded-[10px] group-hover:top-[-65px] ${hoverClassImg2}`}
            />

            <img alt="frontplate of folder" src="/assets/folder/folder_front.png" className={`absolute top-2 left-1/2 -translate-x-1/2 min-w-[125px] min-h-full object-contain origin-bottom transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transform:translateX(-50%)_rotateX(-30deg)] ${hoverClassFront}`} />
        </div>
    );
}
