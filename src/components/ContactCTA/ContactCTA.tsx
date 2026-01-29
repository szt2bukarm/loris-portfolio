"use client"
import GrayButton from "../Common/GrayButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useEffect } from "react";
import { useStore } from "../../app/useStore";

gsap.registerPlugin(ScrollTrigger);

export default function ContactCTA() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { setOpenContact } = useStore();

    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useGSAP(() => {
        if (windowWidth >= 768) {
            gsap.set(containerRef.current, { height: "0vh", opacity: 1 });

            ScrollTrigger.create({
                trigger: "section[data-gsap='contact']",
                start: "top 90%",
                end: "bottom 90%",
                scrub: true,
                markers: true,
                animation: gsap.fromTo(
                    containerRef.current,
                    {
                        height: "0vh",
                    },
                    {
                        height: "70vh",
                        ease: "none",
                    }
                ),
                onEnter: () => {
                    gsap.set(containerRef.current, { opacity: 1 });
                },
                onLeaveBack: () => {
                    gsap.set(containerRef.current, { height: "0vh", opacity: 0 });
                },
            });
        } else {
            // Kill ANY existing ScrollTriggers for this section to ensure mobile is static
            const triggers = ScrollTrigger.getAll();
            triggers.forEach(st => {
                if (st.vars.trigger === "section[data-gsap='contact']") {
                    st.kill();
                }
            });
            // Reset to mobile state if below breakpoint
            gsap.set(containerRef.current, { height: "70vh", opacity: 1, clearProps: "all" });
        }
    }, [windowWidth]);

    return (
        <section
            data-gsap="contact"
            className="relative w-full min-h-[70vh] px-[25px] flex items-start justify-center md:overflow-hidden"
        >
            <div
                ref={containerRef}
                className="relative w-full h-[70vh] p-[2px] bg-gradient-to-b from-[#0C0E0F] to-[#4D4D4D] rounded-[25px] opacity-100 md:overflow-hidden mb-[75px] md:mb-[0]"
            >
                {/* Image */}
                <div className="absolute inset-[2px] rounded-[24px] overflow-hidden z-0">
                    <img
                        src="/assets/contact_bg.webp"
                        className="w-full min-h-[70vh] max-h-[70vh] h-[89vh] object-cover object-[80%] sm:object-[85%]"
                    />
                    <div className="absolute bottom-0 w-full h-[400px] bg-gradient-to-b from-transparent to-black/90 z-10" />
                </div>

                {/* CONTENT — vertically centered, left anchored */}
                <div
                    className="
                        absolute
                        md:inset-y-0
                        md:left-[13vw]
                        z-20
                        md:min-h-[70vh]
                        md:max-h-[70vh]
                        md:h-[70vh]
                        bottom-[-40px]
                        left-1/2 -translate-x-1/2 md:translate-x-0
                        flex flex-col items-center justify-center
                        w-full md:w-fit
                    "
                >
                    <div className="flex items-center mb-[15px]">
                        <div className="w-[65px] h-[65px] rounded-full p-[2.5px] flex items-center justify-center bg-gradient-to-b from-white to-midgray">
                            <img
                                src="/assets/loris.webp"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="w-[65px] h-[65px] rounded-full -ml-5">
                            <img
                                src="/assets/client_icon.webp"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>

                    <p className="text-white font-intranet text-h4 lg:text-h3 mb-[25px] ">
                        LET'S WORK TOGETHER
                    </p>

                    <GrayButton onClick={() => setOpenContact(true)} text="Contact" />
                </div>
            </div>
        </section>
    );
}
