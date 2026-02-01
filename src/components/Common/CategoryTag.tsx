interface Props {
    icon: string;
    category: string;
}

export default function CategoryTag({icon, category}: Props) {
    return (
        <div className="border-[1px] border-[#292929] rounded-[50px] py-[9px] px-[11px] w-fit flex items-center gap-[5px]">
            <img alt="category icon" src={icon} className="brightness-200" />
            <p className="text-brightgray font-ppsemibold text-sm leading-[14px]">{category}</p>
        </div>
    )
} 