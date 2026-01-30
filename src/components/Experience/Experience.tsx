"use client"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
import { useRef } from "react"
import SplitText from "gsap/SplitText"

gsap.registerPlugin(ScrollTrigger, SplitText)

const data = [
    {
        title: "education",
        content: (
            <p className="text-md text-brightgray lg:w-[260px]">
                • BA in Graphic Design — Eszterházy Károly University, Hungary [2022–2025]
            </p>
        ),
    },
    {
        title: "stack",
        content: (
            <p className="text-md text-brightgray lg:w-[300px] xl:w-[450px]">
                Photoshop / Illustrator / InDesign / After Effects / Blender / Glyphs /
                Figma / Rive / Webflow / Framer
            </p>
        ),
    },
    {
        title: "experience",
        content: (
            <>
                <p className="text-md text-brightgray lg:w-[300px] xl:w-[446px]">
                    • Associate Creative Director – WORLDS [2024–]
                </p>
                <p className="text-md text-brightgray lg:w-[300px] xl:w-[446px] opacity-75 ml-5">
                    Visual Identity, Lead Graphic Designer, UI Designer, Concept Art Direction
                </p>

                <p className="text-md text-brightgray lg:w-[300px] xl:w-[446px]">
                    • Freelancing [2023–]
                </p>
                <p className="text-md text-brightgray lg:w-[300px] xl:w-[446px] opacity-75 ml-5">
                    Various websites, branding and 3D rendering projects
                </p>
            </>
        ),
    },
    {
        title: "I can help you with",
        content: (
            <p className="text-md text-brightgray lg:w-[300px] xl:w-[437px]">
                End-to-end Web Design and Implementation, UI/UX design, Brand Identity,
                Graphic Design, 3D Product Renderings, and more
            </p>
        ),
    },
    {
        title: "selected clients",
        content: (
            <div className="flex sm:items-center lg:w-[300px] flex-col sm:flex-row xl:w-full flex-wrap gap-[20px] md:gap-[32px]">
                <div className="overflow-hidden">
                    <img src="/assets/clients/stc.png" className="experience-client-logo w-[65px] mt-[10px] md:mt-0" />
                </div>
                <div className="overflow-hidden">
                    <img src="/assets/clients/parkbee.png" className="experience-client-logo w-[145px]" />
                </div>
                <div className="overflow-hidden">
                    <img src="/assets/clients/amca.png" className="experience-client-logo w-[142px]" />
                </div>
            </div>
        ),
    },
]

/* ---------------------------------- */
/* MOBILE                              */
/* ---------------------------------- */

const ExperienceMedium = () => {
    const rows = useRef<HTMLDivElement[]>([])

    useGSAP(() => {
        rows.current.forEach((row, i) => {
            const splitTitle = new SplitText(
                `[data-gsap='experience-title-${i}-medium']`,
                { type: "lines", linesClass: "line" }
            )

            const splitContent = new SplitText(
                `[data-gsap='experience-content-${i}-medium']`,
                { type: "lines", linesClass: "line" }
            )

            const wrapLines = (lines: HTMLElement[]) => {
                lines.forEach(line => {
                    const wrapper = document.createElement("div")
                    wrapper.style.overflow = "hidden"
                    line.parentNode?.insertBefore(wrapper, line)
                    wrapper.appendChild(line)
                })
            }

            wrapLines(splitTitle.lines as HTMLElement[])
            wrapLines(splitContent.lines as HTMLElement[])

            gsap.set(
                `[data-gsap='experience-title-${i}-medium'] .line,
         [data-gsap='experience-content-${i}-medium'] .line`,
                { yPercent: 130 }
            )
            gsap.set(row.querySelectorAll(".experience-client-logo"), { yPercent: 130 })

            setTimeout(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.create({
                        trigger: row,
                        start: "top 80%",
                        onEnter: () => {
                            gsap.to(splitTitle.lines, {
                                yPercent: 0,
                                duration: 1.2,
                                stagger: 0.1,
                                ease: "out",
                            })

                            gsap.to(splitContent.lines, {
                                yPercent: 0,
                                duration: 1.2,
                                stagger: 0.1,
                                ease: "out",
                            })

                            gsap.to(row.querySelectorAll(".experience-client-logo"), {
                                yPercent: 0,
                                duration: 0.6,
                                stagger: window.innerWidth < 640 ? 0.1 : 0,
                                delay: 0.3,
                                ease: "out",
                            })
                        },
                    })
                })
            }, 1);
        })
    })

    return (
        <section className="lg:hidden relative w-full px-[10px] sm:px-[20px] py-[90px] md:py-[150px] flex flex-col gap-[45px] md:gap-[90px]">
            {data.map((entry, i) => (
                <div
                    key={i}
                    ref={el => el && (rows.current[i] = el)}
                    className="flex flex-col md:flex-row justify-between md:gap-[50px]"
                >
                    <div className="md:w-[50%]">
                        <p
                            data-gsap={`experience-title-${i}-medium`}
                            className="font-intranet text-h3 text-midgray md:text-brightgray"
                        >
                            {entry.title}
                        </p>
                    </div>

                    <div
                        data-gsap={`experience-content-${i}-medium`}
                        className="md:w-[50%]"
                    >
                        {entry.content}
                    </div>
                </div>
            ))}
        </section>
    )
}

/* ---------------------------------- */
/* DESKTOP                             */
/* ---------------------------------- */

const ExperienceLarge = () => {
    const dataRows = useRef<HTMLDivElement[]>([])

    useGSAP(() => {
        setTimeout(() => {
            requestAnimationFrame(() => {
                dataRows.current.forEach(row => {
                    ScrollTrigger.create({
                        trigger: row,
                        start: "top-=100 50%",
                        end: "bottom+=100 50%",
                        onUpdate: self => {
                            const p = self.progress
                            const opacity = 0.5 + 0.5 * Math.sin(Math.PI * p)
                            const gap = 220 + 100 * Math.sin(Math.PI * p)

                            gsap.set(row, { opacity, gap })
                        },
                    })
                })
            })
        }, 1);
    }, [])

    useGSAP(() => {
        dataRows.current.forEach((row, i) => {
            const splitTitle = new SplitText(
                `[data-gsap='experience-title-${i}']`,
                { type: "lines", linesClass: "line" }
            )

            const splitContent = new SplitText(
                `[data-gsap='experience-content-${i}']`,
                { type: "lines", linesClass: "line" }
            )

            const wrapLines = (lines: HTMLElement[]) => {
                lines.forEach(line => {
                    const wrapper = document.createElement("div")
                    wrapper.style.overflow = "hidden"
                    line.parentNode?.insertBefore(wrapper, line)
                    wrapper.appendChild(line)
                })
            }

            wrapLines(splitTitle.lines as HTMLElement[])
            wrapLines(splitContent.lines as HTMLElement[])

            gsap.set(
                `[data-gsap='experience-title-${i}'] .line,
         [data-gsap='experience-content-${i}'] .line`,
                { yPercent: 130 }
            )
            gsap.set(row.querySelectorAll(".experience-client-logo"), { yPercent: 130 })

            ScrollTrigger.create({
                trigger: row,
                start: "top-=300 50%",
                onEnter: () => {
                    gsap.to(splitTitle.lines, {
                        yPercent: 0,
                        duration: 1.2,
                        stagger: 0.1,
                        ease: "out",
                    })

                    gsap.to(splitContent.lines, {
                        yPercent: 0,
                        duration: 1.2,
                        stagger: 0.1,
                        ease: "out",
                    })

                    gsap.to(row.querySelectorAll(".experience-client-logo"), {
                        yPercent: 0,
                        duration: 0.6,
                        stagger: 0,
                        delay: 0.3,
                        ease: "out",
                    })
                },
            })
        })
    })

    return (
        <section className="hidden lg:block relative w-full py-[170px]">
            <div className="relative mx-auto max-w-[1200px]">

                <div className="absolute left-1/2 -translate-x-1/2 top-[33px] h-full pointer-events-none">
                    <div className="sticky top-[50vh] -translate-y-1/2 flex justify-center">
                        <img
                            src="/icons/experience_icon.png"
                            className="w-[92px]"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-[60px]">
                    {data.map((entry, i) => (
                        <div
                            key={i}
                            ref={el => el && (dataRows.current[i] = el)}
                            className="flex gap-[220px] items-center opacity-50"
                        >
                            <p
                                data-gsap={`experience-title-${i}`}
                                className="font-intranet text-h3 text-brightgray w-[500px] text-right"
                            >
                                {entry.title}
                            </p>

                            <div
                                data-gsap={`experience-content-${i}`}
                                className="w-[500px] font-ppsemibold"
                            >
                                {entry.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default function Experience() {
    return (
        <>
            <ExperienceMedium />
            <ExperienceLarge />
        </>
    )
}
