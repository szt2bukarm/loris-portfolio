"use client";
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useStore } from '@/app/useStore';
import { useEnvironment, useGLTF } from '@react-three/drei';
import { useGSAP } from '@gsap/react';

const assets = [
  "/assets/project_images/36daysoftype/thumb.webp",
  "/assets/project_images/36daysoftype/banner.webp",
  "/assets/project_images/amca/thumb.webp",
  "/assets/project_images/amca/banner.webp",
  "/assets/project_images/aughtsspective/thumb.webp",
  "/assets/project_images/aughtsspective/banner.webp",
  "/assets/project_images/dailyui/thumb.webp",
  "/assets/project_images/dailyui/banner.webp",
  "/assets/project_images/daydream/thumb.webp",
  "/assets/project_images/daydream/banner.webp",
  "/assets/project_images/daydream_web/thumb.webp",
  "/assets/project_images/daydream_web/banner.webp",
  "/assets/project_images/ikon_web/thumb.webp",
  "/assets/project_images/ikon_web/banner.webp",
  "/assets/project_images/loben/thumb.webp",
  "/assets/project_images/orith/thumb.webp",
  "/assets/project_images/orith/banner.webp",
  "/assets/project_images/pneuma/thumb.webp",
  "/assets/project_images/pneuma/banner.webp",
  "/assets/project_images/posterfolio/thumb.webp",
  "/assets/project_images/posterfolio/banner.webp",
  "/assets/project_images/wayer/thumb.webp",
  "/assets/project_images/wayer/banner.webp",
  "/handshake_overlay.webp",
  "/assets/contact_bg.webp"
];


export default function Loader() {
  const loaded = useStore((state) => state.loaded);
  const setLoaded = useStore((state) => state.setLoaded);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [hideLoader, setHideLoader] = useState(false);
  const [domReady, setDomReady] = useState(false);

  // ---- preload helper for normal images ----
  const preloadAssets = (urls: string[], limit = 100) =>
    new Promise<void>((resolve) => {
      let loadedCount = 0;
      const total = urls.length;

      if (total === 0) {
        setProgress(limit);
        progressRef.current = limit;
        resolve();
        return;
      }

      urls.forEach((url) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          const prog = (loadedCount / total) * limit;
          setProgress(prog);
          progressRef.current = prog;
          if (loadedCount >= total) resolve();
        };
        img.src = url;
      });
    });


  // ---- initial setup ----
  useEffect(() => {
    useGLTF.preload('/keychain.glb');

    const onDOMContentLoaded = () => setDomReady(true);
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setDomReady(true);
    } else {
      window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
    }

    return () => window.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
  }, []);

  // ---- preload all assets ----
  useEffect(() => {
    const loadAll = async () => {
      try {
        await preloadAssets(assets, 100);
        setTimeout(() => setLoaded(true), 100);

      } catch (e) {
        console.error("Asset preload error:", e);
        setTimeout(() => setLoaded(true), 100);
      }
    };
    loadAll();
  }, []);

  // ---- trigger hide loader ----
  useEffect(() => {
    if (loaded && domReady) setHideLoader(true);
  }, [loaded, domReady]);

  // ---- GSAP fadeout + post-load ----
  useGSAP(() => {
    if (!hideLoader) return;

    gsap.to('[data-gsap="loader-logo-full"]', {
      scale: 1.2,
      filter: "blur(10px)",
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        gsap.to('[data-gsap="loader"]', {
          opacity: 0,
          duration: 0.5
        });
      }
    })
  }, [hideLoader]);

  useEffect(() => {
    gsap.to('[data-gsap="loader-bg"]', {
      opacity: 0,
      duration: 0.25,
    })
  }, [])

  return (
    <div
      data-gsap="loader"
      className="pointer-events-none fixed top-0 right-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center"
    >
      <img src="/icons/loader.svg" className='fixed top-[40px] lg:top-[50px]  right-[10px] sm:right-[20px] lg:right-[50px] loader ' alt="Loader" />
      <div data-gsap="loader-bg" className='w-screen h-screen bg-black z-[9999] fixed top-0 right-0' />
    </div>
  );
}
