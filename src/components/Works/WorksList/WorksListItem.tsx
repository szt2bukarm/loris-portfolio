import { useEffect, useState } from "react";

interface Props {
    category: {
        icon: string;
        category: string;
    },
    title: string,
    year: string,
    slug: string,
    onSelect: (slug: string) => void,
    className?: string
}

export default function WorksListItem({ category, title, year, slug, onSelect, className }: Props) {
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [])

    return (
        <div data-gsap="works-list-item" className={`opacity-0 flex justify-center lg:justify-start items-center min-h-[40px] ${className} mx-auto lg:mx-0 w-[90vw] md:w-[80vw] lg:w-fit`}>

            <div onClick={() => onSelect(slug)} data-hover-target="wrapper" className="relative w-full h-full flex cursor-pointer transition-all duration-150 group">
                <div className="w-fit lg:w-[150px]">
                    <div data-hover-target="category" className={`${(windowWidth <= 1024 && windowWidth != 0) ? "!w-full" : "w-[32px]"} h-[32px] flex items-center gap-[5px] rounded-[99px] border-[1.5px] border-[#8b8b8b42] pl-[4px] pr-[4px] lg:pr-[6px] text-ppregular text-brightgray text-sm overflow-hidden transition-all duration-150`}>
                        <div className="min-w-[22px] min-h-[22px] flex items-center justify-center p-[1px] translate-x-[0.5px]">
                        <img alt="category icon" src={category.icon} className={`w-full h-full object-contain  brightness-200 ${category.category === "UI/UX" ? "scale-[0.85] translate-x-[1.5px]" : "scale-100"} 

                        ${category.category === "UI/UX" ? "scale-[0.88] translate-x-[-0.1px]"  : ""}
                        ${category.category === "Graphics" ? "scale-90" : ""}
                        ${category.category === "Product" ? "scale-90 translate-x-[-1px]" : ""}
                        ${category.category === "Web" ? "translate-x-[-0.5px]" : ""}`} />
                        </div>
                        <p className="mr-[4px] leading-[100%] whitespace-nowrap">{category.category}</p>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 w-full text-center lg:w-fit lg:text-start lg:relative lg:left-0 lg:translate-x-0">
                    <p data-hover-target="title" className="text-xl leading-[31px] text-white font-ppsemibold transition-opacity duration-150">{title}</p>
                </div>

                <p className=" font-ppregular text-right text-md text-white/50 ml-auto lg:ml-[60px] mb-auto translate-y-[0.8px]">{year}</p>
            </div>

        </div>
    )
}