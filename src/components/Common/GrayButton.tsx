interface BtnProps {
    onClick?: () => void;
    disabled?: boolean;
    text: string;
    type?: "button" | "submit" | "reset";
}

export default function GrayButton({ onClick, disabled, text, type = "button" }: BtnProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            className="group p-[0px] bg-gradient-to-b from-[#ECEEED] via-[#616362] to-[#92B2AD] rounded-full overflow-hidden hover:py-[5px] hover:px-[5px] transition-all duration-300 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {/* Inner gradient + shadow wrapper */}
            <div className="relative flex items-center justify-center px-[50px] py-[25px] rounded-full transition-all duration-300
                      group-hover:py-[20px] group-hover:px-[45px] overflow-hidden">

                {/* Gradient layers */}
                <div className="absolute inset-0 rounded-full pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#CFD3D2] to-[#636E6D] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#636E6D] to-[#CFD3D2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Hover inset shadow for depth */}
                <div className="absolute inset-0 rounded-full pointer-events-none
                        group-hover:shadow-[inset_0_-5px_8px_rgba(0,0,0,0.4)] transition-shadow duration-300" />

                {/* Content */}
                <p className="relative text-lg translate-y-[0.5px] text-[#3A3A3A] font-ppsemibold overflow-hidden z-10 leading-[130%] group-hover:scale-[0.98] transition-all duration-300">
                    {/* Inner shadow text */}
                    <span className="absolute inset-0 z-0 text-black/10 blur-[1px]">
                        {text}
                    </span>
                    <span className="relative z-10">{text}</span>
                </p>
            </div>
        </button>
    )
}
