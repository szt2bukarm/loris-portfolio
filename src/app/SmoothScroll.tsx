"use client";
import { ReactLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useStore } from "./useStore";
gsap.registerPlugin(CustomEase);

function SmoothScroll({ children }: { children: React.ReactNode }) {
    gsap.registerEase("customEase", CustomEase.create("out", ".9,.6,.2,1"));
    gsap.registerEase("customEaseIn",CustomEase.create("in", ".8,0,.1,.4"));
    gsap.registerEase("customEaseBounce",CustomEase.create("bounce", ".8,0,.1,.4"));
    gsap.registerEase("genyo",CustomEase.create("genyo", ".2,.6,.015,1"));
    const {loaded} = useStore();
    gsap.config({
        nullTargetWarn: false,
    });


    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1 }}>
            {loaded && <main
             className="w-full h-full" key={loaded ? 1 : 0}
            >{children}</main>}
        </ReactLenis>
    );
}

export default SmoothScroll;