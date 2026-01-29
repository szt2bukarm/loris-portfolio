import { useEffect } from "react";
import UnicornScene from "unicornstudio-react";
import gsap from "gsap";

export default function ContactHandsake({ onClick }: { onClick: () => void }) {
    useEffect(() => {
        gsap.set("[data-gsap='contact-handsake']", {
            opacity: 0,
            pointerEvents: "none"
        })
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div data-gsap="contact-handshake" className="opacity-0 pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="sm:w-[500px] sm:h-[500px] relative sm:[@media(max-height:1000px)]:w-[450px] sm:[@media(max-height:1000px)]:h-[450px] sm:[@media(max-height:750px)]:w-[400px] sm:[@media(max-height:750px)]:h-[400px] h-[250px] w-[250px]">
                <div className="w-[180%] h-[188%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
                    <UnicornScene jsonFilePath="/handshake.json" dpi={1} />
                </div>1
                <img src="/handshake_overlay.webp" alt="handshake overlay" className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blend-lighten scale-[1.06] opacity-75" />
            </div>

            <div className="flex flex-col items-center justify-center mt-[60px] sm:[@media(max-height:750px)]:-mt-[40px] sm:[@media(max-height:500px)]:translate-y-[-100px] z-10">
                <p className="text-brightgray text-h4 font-intranet mb-[8px]">THANK YOU</p>
                <p className="text-white text-sm font-ppregular mb-[50px] sm:mb-[100px] sm:[@media(max-height:750px)]:mb-[50px] text-center">Thank you for your message. I’ll be in touch shortly.</p>

                <button onClick={onClick} className="relative inline-block px-8 py-3 hover:px-12 transition-all duration-150 text-white group -mt-4 [@media(max-height:750px)]:mt-0">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FBFBFB80] rounded-tl-[14px]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FBFBFB80] rounded-tr-[14px]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FBFBFB80] rounded-bl-[14px]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FBFBFB80] rounded-br-[14px]"></div>

                    <span className="text-sm font-ppregular">close</span>
                </button>
            </div>
        </div>
    )
}