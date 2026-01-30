import WorksGridCategoryIcon from "./WorksGridCategoryIcon";
import { useStore } from "@/app/useStore";

interface Props {
    thumbnail: string;
    title: string;
    year: string;
    authors: string[];
    category: { icon: string, category: string }[];
    theme: string;
    slug: string;
    onSelect: (slug: string) => void;
}

export default function WorksGridItem({
    thumbnail,
    title,
    year,
    authors,
    category,
    theme,
    slug,
    onSelect
}: Props) {
    const { isMobile } = useStore();

    return (
        <div onClick={() => onSelect(slug)} data-gsap="grid-item" className="overflow-hidden group relative h-[80vw] md:h-[35vw] lg:h-[24vw] 2xl:h-[19vw] w-auto rounded-[10px] flex flex-col justify-between p-[15px] cursor-pointer opacity-0" style={{ background: `url(${thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }}>

            <div className={`z-0 absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black transition-all duration-150 ${isMobile ? "opacity-50" : "group-hover:opacity-35 opacity-0"}`}></div>

            {/* icons */}
            <div className={`z-[1] flex items-center transition-all duration-150 ${isMobile ? "opacity-100" : "group-hover:opacity-100 opacity-0"}`}>
                {category.map((cat, index) => (

                    <WorksGridCategoryIcon key={index} icon={cat.icon} theme={theme} category={cat.category} index={index} />
                ))}
            </div>

            <div className={`z-[1] flex justify-between items-center transition-all duration-150 ${isMobile ? "opacity-100" : "group-hover:opacity-100 opacity-0"}`}>
                <div className="flex flex-col">
                    <p className="text-md font-ppsemibold text-white">{title}</p>
                    <p className="text-md font-ppsemibold text-white/50">{year}</p>
                </div>

                <div className="flex">
                    {authors.map((author, index) => (
                        <div key={index} className="flex items-center justify-center w-[38px] h-[38px] bg-gradient-to-b from-white to-midgray rounded-full ml-[-10px]">
                            <img src={author} className="w-[34px] h-[34px] object-cover rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}