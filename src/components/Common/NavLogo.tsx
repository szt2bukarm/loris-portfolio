"use client"
import { Link } from "next-view-transitions";
import { useStore } from "@/app/useStore";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export default function NavLogo() {
    const loaded = useStore((state) => state.loaded);
    const setOpenContact = useStore((state) => state.setOpenContact);

    useGSAP(() => {
        if (!loaded) return;
        gsap.to("[data-gsap='contact-nav']", {
            opacity: 1,
            pointerEvents: "all",
            duration: 0.5,
            ease: "linear",
            delay: 2
        })
    }, [loaded])

    return (
        <>
        <Link href={"/"}>
            <img alt="logo" src="/icons/logo.svg" className="fixed top-[40px] left-[10px] sm:left-[20px] lg:left-[50px] lg:top-[50px] w-[35px] z-[500] mix-blend-screen" style={{viewTransitionName: "nav"}}/>
        </Link>
        <button onClick={() => setOpenContact(true)} data-gsap="contact-nav" style={{viewTransitionName: "navContact"}} className="opacity-0 pointer-events-none fixed top-[30px] lg:top-[40px] right-[10px] sm:right-[20px] lg:right-[50px] inline-block px-6 py-2 hover:px-4 transition-[padding] duration-150 text-white group z-[90]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-[2px] border-l-[2px] border-[#FBFBFB80] rounded-tl-[10px]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-[2px] border-r-[2px] border-[#FBFBFB80] rounded-tr-[10px]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[2px] border-l-[2px] border-[#FBFBFB80] rounded-bl-[10px]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[2px] border-r-[2px] border-[#FBFBFB80] rounded-br-[10px]"></div>

                <span className="text-sm font-ppsemibold">Contact</span>
            </button>
        </>
    )
}