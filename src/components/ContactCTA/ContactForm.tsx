"use client";

import { useState, useEffect } from "react";
import GrayButton from "../Common/GrayButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useStore } from "../../app/useStore";
import { useLenis } from "@studio-freight/react-lenis"

export default function ContactForm({ onClose }: { onClose: () => void }) {
    const isMobile = useStore((state) => state.isMobile);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const lenis = useLenis();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [formHeight, setFormHeight] = useState("430px");

    const updateFormHeight = () => {
        if (typeof window !== 'undefined') {
            const h = window.innerHeight;
            const w = window.innerWidth;

            // Base height
            let newHeight = "430px";

            if (w >= 768) {
                if (h >= 1250) {
                    newHeight = "70%";
                } else if (h < 1250 && h >= 1150) {
                    newHeight = "67%";
                } else if (h < 1150 && h >= 1050) {
                    newHeight = "63%";
                } else if (h < 1050 && h >= 950) {
                    newHeight = "61%";
                } else if (h < 950 && h >= 750) {
                    newHeight = "69%";
                } else if (h < 750) {
                    newHeight = "55%";
                }
            }

            setFormHeight(newHeight);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const isFormValid = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.message.trim() !== "";

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (status === "loading") return;

        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                lenis?.scrollTo(0);
                gsap.to('[data-gsap="contact-feedback-wrapper"]', {
                    opacity: 0,
                    duration: 0.15,
                    ease: "linear"
                })
                gsap.to("[data-gsap='contact-form-wrapper']", {
                    opacity: 0,
                    duration: 0.15,
                    ease: "linear",
                    onComplete: () => {
                        gsap.to("[data-gsap='contact-handshake']", {
                            opacity: 1,
                            duration: 0.15,
                            pointerEvents: "auto",
                            ease: "linear"
                        })
                    }
                })
                setFormData({ name: "", email: "", message: "" });
            } else {
                console.error("Submission error:", data);
                setStatus("error");
                const errorMsg = "Something went wrong. Please try again later.";
                setErrorMessage(errorMsg);
            }
        } catch (error) {
            console.error("Network error:", error);
            setStatus("error");
            setErrorMessage("Network error. Please try again.");
        }
    };


    useGSAP(() => {
        // icon bounce entrance
        gsap.set("[data-gsap='contact-personicon']", {
            scale: 0,
        })
        gsap.to("[data-gsap='contact-personicon']", {
            scale: 1,
            duration: 0.75,
            ease: "back.out(2.5)",
            stagger: 0.2,
        })

        gsap.from("[data-gsap='contact-title']", {
            y: 80,
            duration: 1.2,
            ease: "out"
        })

        gsap.from("[data-gsap='contact-subtitle']", {
            opacity: 0,
            duration: 0.3,
            delay: 0.5,
            ease: "linear"
        })

        gsap.from("[data-gsap='contact-form']", {
            opacity: 0,
            duration: 0.4,
            delay: 0.5,
            ease: "power4.out"
        })

        gsap.from("[data-gsap='contact-form-wrapper']", {
            y: "100%",
            duration: 1.2,
            delay: 0.,
            ease: "genyo"
        })

    }, [])

    useEffect(() => {
        updateFormHeight();
        const handleResize = () => updateFormHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [])


    return (
        <div data-gsap="contact-form-wrapper" onClick={(e) => e.stopPropagation()} className="w-[calc(100vw-20px)] mx-auto mt-[20px] xl:mt-0 md:w-[720px] h-[900px] md:h-[100vh] p-[1px] bg-gradient-to-b from-[#666666] via-[#000000] to-[#4D4D4D] rounded-[30px]">
            <div className="relative w-full h-full flex flex-col items-center bg-[#101010] rounded-[30px] z-10 pt-[35px] overflow-hidden">
                <div className="absolute left-1/2 -translate-x-1/2 top-[-75px] w-[300px] h-[150px] bg-brightgray blur-[100px] z-0" />

                <button onClick={onClose} className="absolute top-[20px] right-[20px] w-[50px] h-[50px] rounded-full bg-white/[0.1] backdrop-blur-[10px] border border-[#494949] z-10 flex items-center justify-center hover:brightness-200 transition-[filter] duration-300 cursor-pointer">
                    <img src="/icons/close.svg" alt="close icon" />
                </button>

                <div className="flex flex-col items-center z-10 mb-[25px] pointer-events-none">
                    <div className="flex items-center mb-[15px]">
                        <div data-gsap='contact-personicon' className="w-[65px] h-[65px] rounded-full p-[2.5px] flex items-center justify-center bg-gradient-to-b from-white to-midgray ">
                            <img alt="Portrait of Loris" src="/assets/loris.webp" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div data-gsap='contact-personicon' className="w-[65px] h-[65px] rounded-full p-[2.5px] flex items-center justify-center bg-gradient-to-b from-white to-midgray -ml-5">
                            <img alt="Icon representing a future client" src="/assets/client_icon.webp" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>

                    <div className="w-full h-full overflow-hidden">
                        <p data-gsap="contact-title" className="text-white font-intranet text-h4 sm:text-h3 mb-[10px] leading-[130%] text-center">LET'S WORK TOGETHER</p>
                    </div>
                    <p data-gsap="contact-subtitle" className="text-white/50 font-ppregular text-sm w-[70%] text-center sm:w-full">Tell me a bit about your project, timeline, and rough budget below...</p>
                </div>

                <form data-gsap="contact-form" onSubmit={handleSubmit} className="w-[calc(100%-10px)] sm:w-[calc(100%-40px)] z-10 flex flex-col items-center flex-1">
                    <div style={{ height: formHeight }} className="w-full bg-[#060606] border border-[#232323] rounded-[27px] p-[15px] flex flex-col mb-[20px]">

                        {/* top inputs */}
                        <div className="flex gap-[8px] mb-[8px] flex-col md:flex-row">
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="w-full h-[50px] bg-[#1010107a] border border-[#50505080] rounded-[15px] px-[20px] text-white font-ppsemibold outline-none focus:border-white/30 transition-colors placeholder:text-brightgray shadow-[inset_0_-2px_31px_#CDCDCD15]"
                                required
                            />

                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full h-[50px] bg-[#1010107a] border border-[#50505080] rounded-[15px] px-[20px] text-white font-ppsemibold outline-none focus:border-white/30 transition-colors placeholder:text-brightgray shadow-[inset_0_-2px_31px_#CDCDCD15]"
                                required
                            />
                        </div>

                        {/* textarea fills remaining space */}
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your Message"
                            className="w-full flex-1 resize-none overflow-y-auto bg-[#1010107a] border border-[#50505080] rounded-[15px] p-[20px] text-white font-ppsemibold outline-none focus:border-white/30 transition-colors placeholder:text-brightgray shadow-[inset_0_-2px_31px_#CDCDCD15]"
                            required
                        />
                    </div>

                    <div className="flex flex-col items-center gap-[30px] md:[@media(max-height:950px)]:flex-row justify-center">
                        <GrayButton
                            disabled={!isFormValid || status === "loading"}
                            type="submit"
                            text={status === "loading" ? "Sending..." : "Send"}
                        />

                        <p className="text-white/50 font-ppregular text-sm text-center [@media(max-height:750px)]:mx-[15px]">OR</p>

                        <div className="min-w-[340px] flex items-center justify-center">
                            <a href="mailto:studio@lorisbukvic.graphics" className="relative inline-block px-6 py-4 hover:px-8 transition-all duration-150 text-white group -mt-4 [@media(max-height:950px)]:mt-0">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FBFBFB80] rounded-tl-[14px]"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FBFBFB80] rounded-tr-[14px]"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FBFBFB80] rounded-bl-[14px]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FBFBFB80] rounded-br-[14px]"></div>

                            <span className="text-sm font-ppregular">Send email to studio@lorisbukvic.graphics</span>
                        </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
