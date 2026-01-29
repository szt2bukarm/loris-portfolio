"use client"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "next-view-transitions";
import { Observer } from "gsap/all";
import { useRef, useState } from "react";
import FolderButton from "../FolderButton/FolderButton";
import { useLenis } from "@studio-freight/react-lenis";

gsap.registerPlugin(Observer);

const workImages = [
    "aughtsspective/thumb.webp",
    "daydream/thumb.webp",
    "daydream_web/thumb.webp",
    "pneuma/thumb.webp",
    "amca/thumb.webp",
    "ikon_web/thumb.webp",
    "loben/thumb.webp",
    "orith/thumb.webp",
    "posterfolio/thumb.webp",
    "36daysoftype/thumb.webp",
    "dailyui/thumb.webp",
    "wayer/thumb.webp",
];

export default function WorksMarquee() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const [isHovered, setIsHovered] = useState(false);

    useGSAP(() => {
        if (!lenis) return;
        lenis.stop();
        gsap.from("[data-gsap='works-marquee-image']", {
            y: 100,
            duration: 1.5,
            stagger: 0.03,
            delay: 2,
            ease: "back.out(1.5)",
            onComplete: () => {
                lenis.start();
            }
        })
    }, [lenis])

    useGSAP(() => {
        const imageLengthWithGap = 284;
        const totalWidth = imageLengthWithGap * workImages.length;

        let x = 0;
        let velocity = 0;
        const baseSpeed = 1;

        const tick = () => {
            velocity *= 0.92;
            x -= baseSpeed + velocity;

            if (x <= -totalWidth) x += totalWidth;
            if (x > 0) x -= totalWidth;

            gsap.set(marqueeRef.current, { x });
        };

        let tickerActive = false;
        let timeoutId: number;

        timeoutId = window.setTimeout(() => {
            gsap.ticker.add(tick);
            tickerActive = true;
        }, 2000);

        const obs = Observer.create({
            target: window,
            type: "wheel,touch",
            onChange: (self) => {
                if (!tickerActive) return; // ignore scroll during entrance
                velocity += Math.abs(self.deltaY) * 0.008;
            },
        });

        return () => {
            clearTimeout(timeoutId);
            if (tickerActive) gsap.ticker.remove(tick);
            obs.kill();
        };
    }, { scope: marqueeRef });

    return (
        <div className="relative h-full w-full md:-mt-[50px] z-[50] overflow-hidden group">
            <Link
                href="/works"
                className="block w-full h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex lg:hidden justify-between mb-[40px] md:mb-[50px] px-[10px] sm:px-[20px]">
                    <p className="text-h4 md:text-h3 text-midgray font-intranet">WORKS</p>
                    <div className="text-md md:text-lg text-brightgray font-ppsemibold hover:opacity-50 duration-150 transition-opacity">Go to Works</div>
                </div>

                <div className="relative h-full w-full pt-[20px]"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%,black 90%, transparent)',
                        maskImage: 'linear-gradient(to right, transparent, black 10%,black 90%, transparent)',
                    }}>

                    <div
                        className="lg:block hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[500px] h-full blur-[15px] scale-125 transition-opacity duration-300"
                        style={{
                            background:
                                "linear-gradient(to right, transparent 0%, #000000a9 20%, #000000e1 40%, #000000e1 60%, #000000a9 80%, transparent 100%)",
                            opacity: isHovered ? 0.8 : 1
                        }}
                    ></div>

                    <div className="lg:block hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="translate-y-[15px] flex flex-col gap-[16px] items-center justify-center w-screen">
                            <FolderButton isExternalHover={isHovered} />
                            <p className={`font-intranet text-md transition-colors duration-300 ${isHovered ? 'text-brightgray' : 'text-midgray'}`}>WORKS</p>
                        </div>
                    </div>

                    <div ref={marqueeRef} data-gsap="works-marquee" className="relative w-full h-full flex gap-[4px] will-change-transform">
                        {workImages.map((img, i) => {
                            return (
                                <div data-gsap="works-marquee-image" key={`set1-${i}`} className="max-w-[280px] min-w-[280px] min-h-full transition-opacity duration-300 group-hover:opacity-60">
                                    <img src={`/assets/project_images/${img}`} className="w-full h-full object-cover" />
                                </div>
                            );
                        })}
                        {workImages.map((img, i) => {
                            return (
                                <div key={`set2-${i}`} className="max-w-[280px] min-w-[280px] min-h-full transition-opacity duration-300 group-hover:opacity-60">
                                    <img src={`/assets/project_images/${img}`} className="w-full h-full object-cover" />
                                </div>
                            );
                        })}
                        {workImages.map((img, i) => {
                            return (
                                <div key={`set3-${i}`} className="max-w-[280px] min-w-[280px] min-h-full transition-opacity duration-300 group-hover:opacity-60">
                                    <img src={`/assets/project_images/${img}`} className="w-full h-full object-cover" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Link>
        </div>
    )
}