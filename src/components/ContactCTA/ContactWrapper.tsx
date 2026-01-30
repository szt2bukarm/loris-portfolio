"use client"
import ContactFeedback from "./ContactFeedback";
import ContactForm from "./ContactForm";
import { useStore } from "../../app/useStore";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import ContactHandsake from "./ContactHandsake";

export default function ContactWrapper() {
    const { openContact, setOpenContact } = useStore();

    useGSAP(() => {
        if (!openContact) return;
        gsap.from("[data-gsap='contact-wrapper']", {
            opacity: 0,
            duration: 0.15,
            ease: "linear"
        })
    }, [openContact])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (openContact) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [openContact]);

    const closeContact = () => {
        gsap.to("[data-gsap='contact-form-wrapper']", {
            y: "100%",
            duration: 0.3,
            ease: "power2.inOut",
        })
        gsap.to("[data-gsap='contact-wrapper']", {
            opacity: 0,
            duration: 0.3,
            delay: 0.15,
            ease: "linear",
            onComplete: () => setOpenContact(false)
        })
    }

    if (!openContact) return null;

    return (
        <div onClick={closeContact} data-gsap="contact-wrapper" className="fixed top-0 left-0 w-screen h-[100dvh] bg-[#000000ef] z-[300] overflow-hidden">
            <ReactLenis options={{ duration: 1, lerp: 0.1 }} className="w-full h-full overflow-y-auto md:overflow-hidden md:overflow-y-hidden">
                <div className="grid xl:grid-cols-2 items-center min-h-full justify-center py-[20px] md:py-0 md:h-[100dvh] overflow-y-hidden overflow-x-hidden">
                    <div data-gsap="contact-feedback-wrapper">
                        <ContactFeedback />
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="w-full h-full xl:translate-x-[-100px] 2xl:translate-x-0 md:translate-y-[-60px] xl:translate-y-[60px] md:scale-[0.85] xl:scale-[1]">
                        <ContactForm onClose={closeContact} />
                    </div>
                </div>
                <ContactHandsake onClick={closeContact} />
            </ReactLenis>
        </div>
    )
}