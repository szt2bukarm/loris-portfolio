export default function WorksGridCategoryIcon({ icon, category, theme, index, isMobile }: { icon: string, category: string, theme: string, index: number, isMobile: boolean | null }) {
    return (
        <div className={`group/categoryicon ${theme === "dark" ? "invert" : ""} relative ${index === 0 ? "w-[38px] h-[38px]" : "w-[24px] h-[24px]"} border-[1px] border-white rounded-full mr-[-5px] flex items-center justify-center bg-[#CBCBCB]`}>
            <img alt="category icon" src={icon} className={`${index === 0 ? "w-[22px]" : "w-[12px]"} object-cover ${category === "UI/UX" && "translate-x-[1px] translate-y-[0.2px]"}`} />
            {!isMobile && (

                <p className={`${theme === "dark" ? "invert" : ""} absolute top-[-40px] left-1/2 -translate-x-1/2 w-fit px-[12px] pt-[8px] pb-[7px] rounded-[25px] bg-black border border-darkgray font-ppsemibold text-white text-sm leading-[100%] group-hover/categoryicon:opacity-100 opacity-0 transition-all duration-150 pointer-events-none`}><span className="block translate-y-[1px]">{category}</span></p>
            )}
        </div>
    )
}