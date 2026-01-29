'use client';

import React, { useEffect, useRef, useMemo } from "react";
import projects from "@/app/data/projects";
import WorksListItem from "./WorksListItem";
import gsap from "gsap";
import { Observer } from "gsap/dist/Observer";
import WorksListItemMobile from "./WorksListItemMobile";

gsap.registerPlugin(Observer);

interface Props {
    onSelect: (slug: string) => void;
    paused?: boolean;
    onHoverChange?: (index: number | null) => void;
}

export default function WorksList({ onSelect, paused, onHoverChange }: Props) {
    const targetYRef = useRef(0);
    const currentYRef = useRef(0);
    const listRef = useRef<HTMLDivElement>(null);
    const mobileListRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef({ x: 0, y: 0 });
    const lastHoveredRef = useRef<HTMLElement | null>(null);

    const pausedRef = useRef(paused);
    const observerRef = useRef<Observer | null>(null);

    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => a.category[0].category.localeCompare(b.category[0].category));
    }, []);

    // Sync paused ref and observer state
    useEffect(() => {
        pausedRef.current = paused;
        if (paused) {
            observerRef.current?.disable();
        } else {
            observerRef.current?.enable();
        }
    }, [paused]);

    useEffect(() => {
        if (!listRef.current) return;

        const loopPointRef = { value: 0 };

        const updateLoopPoint = () => {
            const targetList = window.innerWidth < 640 ? mobileListRef.current : listRef.current;
            if (!targetList) return;

            const firstClone = targetList.children[sortedProjects.length] as HTMLElement;
            if (firstClone && firstClone.offsetTop > 0) {
                loopPointRef.value = firstClone.offsetTop;
            } else {
                loopPointRef.value = targetList.scrollHeight / 3;
            }
        };

        // Wait for layout to settle before calculating loop point
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateLoopPoint();
            });
        });

        const handleTicker = () => {
            if (pausedRef.current) return;

            const isMobile = window.innerWidth < 640;
            const diff = targetYRef.current - currentYRef.current;

            // Snappier, more precise follow on mobile
            const lerpFactor = isMobile ? 0.1 : 0.02;
            currentYRef.current += diff * lerpFactor;

            // Infinite loop logic
            const loopPoint = loopPointRef.value;
            if (loopPoint > 0) {
                if (currentYRef.current >= loopPoint) {
                    currentYRef.current -= loopPoint;
                    targetYRef.current -= loopPoint;
                } else if (currentYRef.current < 0) {
                    currentYRef.current += loopPoint;
                    targetYRef.current += loopPoint;
                }
            }

            // Direct DOM update
            if (listRef.current) {
                listRef.current.style.transform = `translate3d(0, ${-currentYRef.current}px, 0)`;
            }
            if (mobileListRef.current) {
                mobileListRef.current.style.transform = `translate3d(0, ${-currentYRef.current}px, 0)`;
            }

            // --- Scroll-Aware Hover Logic ---
            if (cursorRef.current.x !== 0 || cursorRef.current.y !== 0) {
                const el = document.elementFromPoint(cursorRef.current.x, cursorRef.current.y);
                const target = el?.closest('[data-hover-target="wrapper"]') as HTMLElement | null;

                if (target !== lastHoveredRef.current) {
                    if (lastHoveredRef.current) {
                        const oldTitle = lastHoveredRef.current.querySelector('[data-hover-target="title"]') as HTMLElement;
                        if (oldTitle) oldTitle.style.opacity = '1';

                        const oldCat = lastHoveredRef.current.querySelector('[data-hover-target="category"]') as HTMLElement;
                        if (oldCat) oldCat.style.width = "32px";
                    }

                    if (target) {
                        const newTitle = target.querySelector('[data-hover-target="title"]') as HTMLElement;
                        if (newTitle) newTitle.style.opacity = '0.5';

                        const newCat = target.querySelector('[data-hover-target="category"]') as HTMLElement;
                        if (newCat) newCat.style.width = `${newCat.scrollWidth}px`;

                        const indexContainer = target.closest('[data-index]');
                        if (indexContainer) {
                            const idx = parseInt(indexContainer.getAttribute('data-index') || '-1');
                            if (idx !== -1 && onHoverChange) {
                                onHoverChange(idx);
                            }
                        }
                    } else {
                        if (onHoverChange) onHoverChange(null);
                    }
                    lastHoveredRef.current = target;
                }
            }
        };

        const obs = Observer.create({
            target: window,
            type: 'wheel,touch',
            preventDefault: true,
            onChange: (self) => {
                if (pausedRef.current) return;

                const isMobile = window.innerWidth < 640;
                const isWheel = self.event.type === 'wheel';

                // 1:1 tracking for precision
                const multiplier = isWheel ? 1 : -1.0;
                targetYRef.current += self.deltaY * multiplier;
            },
            onRelease: (self) => {
                if (pausedRef.current || self.event.type === 'wheel') return;
                const isMobile = window.innerWidth < 640;
                if (isMobile) {
                    // Momentum injection for effortless feel
                    const momentumMultiplier = -0.15;
                    targetYRef.current += self.velocityY * momentumMultiplier;
                }
            }
        });
        observerRef.current = obs;

        // Initial disable check
        if (pausedRef.current) {
            obs.disable();
        }

        const onMouseMove = (e: MouseEvent) => {
            cursorRef.current.x = e.clientX;
            cursorRef.current.y = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        gsap.ticker.add(handleTicker);

        const onResize = () => {
            requestAnimationFrame(() => {
                updateLoopPoint();
            });
        };
        window.addEventListener('resize', onResize);

        return () => {
            gsap.ticker.remove(handleTicker);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            if (lastHoveredRef.current) lastHoveredRef.current.classList.remove('active');
            obs.kill();
            observerRef.current = null;
        };
    }, []);

    return (
        <div
            className="absolute bottom-[15px] left-0 lg:left-[40px] right-0 h-[calc(100dvh-130px)] sm:h-[50dvh] lg:h-[calc(100dvh-160px)] overflow-hidden z-[2]"
            style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 45%, black 55%, transparent)',
                touchAction: 'none' // Disable browser touch handling
            }}
        >

            {/* mobile */}
            <div ref={mobileListRef} className="flex sm:hidden w-full flex-col gap-[4px]">
                {[0, 1, 2].map((iteration) => (
                    sortedProjects.map((project, index) => {
                        const prevProject = index > 0 ? sortedProjects[index - 1] : sortedProjects[sortedProjects.length - 1];
                        const differentCategory = project.category[0].category !== prevProject.category[0].category;
                        const className = differentCategory ? "pt-[45px]" : "";

                        return (
                            <div key={`${iteration}-${index}`} className="contents" data-index={index}>
                                <WorksListItemMobile title={project.title} year={project.year} category={project.category} slug={project.slug} onSelect={onSelect} className={className} />
                            </div>
                        )
                    })
                ))}
            </div>

            {/* desktop */}
            <div ref={listRef} className="hidden sm:flex w-full flex-col gap-[4px]">
                {/* work */}
                {[0, 1, 2].map((iteration) => (
                    sortedProjects.map((project, index) => {
                        const prevProject = index > 0 ? sortedProjects[index - 1] : sortedProjects[sortedProjects.length - 1];
                        const differentCategory = project.category[0].category !== prevProject.category[0].category;
                        const className = differentCategory ? "pt-[45px]" : "";

                        return (
                            <div key={`${iteration}-${index}`} className="contents" data-index={index}>
                                <WorksListItem title={project.title} year={project.year} category={project.category[0]} slug={project.slug} onSelect={onSelect} className={className} />
                            </div>
                        )
                    })
                ))}
            </div>

        </div>
    )
}