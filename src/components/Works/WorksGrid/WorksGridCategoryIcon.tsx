export default function WorksGridCategoryIcon({ icon,category,theme,index }: { icon: string, category: string,theme:string,index:number }) {
    return (
        <div className={`group/categoryicon ${theme === "dark" ? "invert" : ""} relative ${index === 0 ? "w-[37px] h-[37px]" : "w-[24px] h-[24px]"} border-[1px] border-white rounded-full mr-[-5px] flex items-center justify-center bg-[#CBCBCB]`}>
            <img src={icon} className={`w-[55%] object-cover translate-x-[1px] ${category === "3D" && "translate-x-[0.25px]"} ${category === "UI/UX" && "translate-x-[1.5px] translate-y-[0.2px]"}`} />
            <p className={`${theme === "dark" ? "invert" : ""} absolute top-[-40px] left-1/2 -translate-x-1/2 w-fit px-[12px] py-[8px] rounded-[25px] bg-black border border-darkgray font-ppsemibold text-white text-sm leading-[100%] group-hover/categoryicon:opacity-100 opacity-0 transition-all duration-150`}><span className="block translate-y-[1px]">{category}</span></p>
        </div>
    )
}