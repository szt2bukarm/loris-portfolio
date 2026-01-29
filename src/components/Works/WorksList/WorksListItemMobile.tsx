import CategoryTag from "@/components/Common/CategoryTag"

interface Props {
    category: { icon: string, category: string }[],
    title: string,
    year: string,
    slug: string,
    onSelect: (slug: string) => void,
    className?: string
}

export default function WorksListItemMobile({ category, title, year, slug, onSelect, className }: Props) {
    return (
        <div data-gsap="works-list-item" className={`opacity-0 flex justify-center items-center min-h-[100px] ${className}`}>

            <div onClick={() => onSelect(slug)} data-hover-target="wrapper" className="w-fit h-full flex flex-col items-center cursor-pointer transition-all duration-150 group">

                <p data-hover-target="title" className="text-xl leading-[31px] text-white font-ppsemibold transition-opacity duration-150 mb-[5px]">{title}</p>

                <div className="flex gap-[2px]">
                    <CategoryTag category={category[0].category} icon={category[0].icon} />
                    <div className="border-[1px] border-[#292929] rounded-[50px] py-[9px] px-[11px] w-fit flex items-center gap-[5px]">
                        <p className="text-brightgray font-ppsemibold text-sm leading-[14px]">{year}</p>
                    </div>
                </div>
            </div>

        </div>
    )
}