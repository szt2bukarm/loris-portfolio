import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import CategoryTag from "@/components/Common/CategoryTag";

import { useStore } from "@/app/useStore";

interface Props {
    title: string;
    description: string;
    image: string;
    category: { icon: string, category: string }[];
    year: string;
    primaryColor: string;
    setHovered: (hovered: boolean) => void;
    slug: string;
    onSelect: (slug: string) => void;
    index?: number;
    onInternalLoad?: () => void;
    shouldReveal?: boolean;
}

export default function WorksFreestyleItem({ title, description, image, category, year, primaryColor, setHovered, slug, onSelect, onInternalLoad, shouldReveal }: Props) {
    const { isMobile } = useStore();
    const itemRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef<HTMLDivElement[]>([]);
    const [position, setPosition] = useState<"left" | "right" | "bottom" | "top">("right");
    const [alignment, setAlignment] = useState<"start" | "end">("start");
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const checkPosition = useCallback(() => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const spaceRight = windowWidth - rect.right;
        const spaceLeft = rect.left;

        const requiredSpace = 600;

        const centerX = rect.left + rect.width / 2;
        const align = centerX < windowWidth / 2 ? "start" : "end";
        setAlignment(align);
        setIsSmallScreen(windowWidth < 800);

        if (spaceRight >= requiredSpace) {
            setPosition("right");
        } else if (spaceLeft >= requiredSpace) {
            setPosition("left");
        } else {
            const centerY = rect.top + rect.height / 2;
            if (centerY > window.innerHeight / 2) {
                setPosition("top");
            } else {
                setPosition("bottom");
            }
        }
    }, []);

    const onMouseOver = () => {
        if (isMobile) return;
        checkPosition();
        setHovered(true);
        console.log(hoverRef.current[1].children)
        gsap.set(hoverRef.current[1].children, {
            filter: "brightness(20)",
        })
        gsap.set(hoverRef.current[0], {
            scale: 1.2
        })
        gsap.to(hoverRef.current[0], {
            scale: 1.25,
            duration: 0.25,
            ease: "power3.out"
        })
        gsap.to(hoverRef.current[1].children, {
            filter: "brightness(1.5)",
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out"
        })
    }

    const onMouseOut = () => {
        if (isMobile) return;
        setHovered(false);
    }

    useEffect(() => {
        checkPosition();
        window.addEventListener("resize", checkPosition);
        return () => window.removeEventListener("resize", checkPosition);
    }, [checkPosition]);

    const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        if (!itemRef.current) return;

        const rect = itemRef.current.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);


        if (hoverRef.current) {
            gsap.set(hoverRef.current, {
                x: x * 10,
                y: y * 10,
            });
        }
    };

    const show = shouldReveal !== undefined ? shouldReveal : isLoaded;

    return (
        <div data-gsap="works-freestyle-item" onClick={() => onSelect(slug)} onMouseOver={onMouseOver} onMouseOut={onMouseOut} ref={itemRef} onMouseMove={(e) => handleHover(e)} className={`group relative flex items-center justify-center h-full w-full aspect-square overflow-visible transition-opacity duration-250 cursor-pointer hover:z-[110] opacity-0 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <img
                src={image}
                onLoad={() => { setIsLoaded(true); onInternalLoad?.(); }}
                onError={() => { onInternalLoad?.(); }}
                className={`w-full h-full object-contain transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}
            />

            {!isMobile && (
                <>
                    <div ref={el => { if (el) hoverRef.current[0] = el }} className="group-hover:opacity-100 opacity-0 absolute inset-0 z-[111] overflow-visible  pointer-events-none">
                        <img src={image} className="w-full h-full object-contain" />
                    </div>

                    <div
                        className={`absolute z-[120] pointer-events-none flex items-center ${position === "left"
                            ? "right-[calc(100%+70px)] inset-y-0"
                            : position === "right"
                                ? "left-[calc(100%+70px)] inset-y-0"
                                : position === "bottom"
                                    ? `top-[calc(100%+50px)] ${isSmallScreen ? (alignment === "start" ? "left-0" : "right-0") : "left-1/2 -translate-x-1/2"}`
                                    : `bottom-[calc(100%+50px)] ${isSmallScreen ? (alignment === "start" ? "left-0" : "right-0") : "left-1/2 -translate-x-1/2"}`
                            }`}
                    >
                        <div
                            ref={el => { if (el) hoverRef.current[1] = el }}
                            className="flex flex-col gap-[10px]
                                        group-hover:opacity-100 opacity-0"
                        >
                            <div className="w-[400px] lg:w-[550px] max-w-[90vw] h-fit flex items-center justify-center p-[1px] bg-gradient-to-b from-[#292929] to-[#4D4D4D] rounded-[40px]">
                                <div className="bg-[#050505] w-full h-full p-[25px] lg:p-[35px] rounded-[39px]">
                                    <p className="text-h4 lg:text-h3 leading-[23px] mb-[20px] font-intranet text-white">{title}</p>
                                    <p className="text-md lg:text-lg leading-[130%] text-brightgray font-ppsemibold">{description}</p>
                                </div>
                            </div>

                            <div className="w-[400px] lg:w-[550px] max-w-[90vw] h-fit flex items-center justify-center p-[1px] bg-gradient-to-b from-[#292929] to-[#4D4D4D] rounded-[40px]">
                                <div className="bg-[#050505] w-full h-full px-[15px] py-[15px] lg:px-[30px] lg:py-[22px] rounded-[39px] flex gap-[5px] flex-wrap">

                                    {category.map((cat, index) => {
                                        return (
                                            <CategoryTag key={index} category={cat.category} icon={cat.icon} />
                                        )
                                    })}

                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    )
}