'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const CONFIG = {
    speed: 5.0,
    bladeSharpness: 4.2,
    bladeIntensity: 1.04,
    specularPower: 15.0,
    specularStrength: 0.59,
    falloffStart: 0.13,
    falloffEnd: 0.77,
    colors: {
        black: new THREE.Color("#000103"),
        steel: new THREE.Color("#376d6c"),
        silver: new THREE.Color("#e0fbfc")
    }
};

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColorBlack;
    uniform vec3 uColorSteel;
    uniform vec3 uColorSilver;
    uniform float uSharpness;
    uniform float uIntensity;
    uniform float uSpecPower;
    uniform float uSpecStrength;
    uniform float uFalloffStart;
    uniform float uFalloffEnd;
    uniform float uAspect;

    varying vec2 vUv;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float ridged(float n) {
        return 1.0 - abs(n * 2.0 - 1.0);
    }

    void main() {
        // Adjust UVs for aspect ratio to prevent stretching
        vec2 uv = vUv;
        vec2 noiseUv = uv;
        noiseUv.x *= uAspect;
        
        // Internal falloff control baked into the blades
        float bladeLife = smoothstep(uFalloffStart, uFalloffEnd, uv.y);
        
        // Diagonal skew orientation
        float angle = 0.65;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 p = rot * noiseUv;

        // Ridged noise generation for geometric folds
        float n = 0.0;
        n += ridged(noise(vec2(p.x * 2.5, p.y * 0.15 + uTime * 0.015))) * 0.5;
        n += ridged(noise(vec2(p.x * 5.0, p.y * 0.3 - uTime * 0.01))) * 0.25;
        n += ridged(noise(vec2(p.x * 10.0, p.y * 0.6 + uTime * 0.02))) * 0.125;

        // Calculate blades with precise sharpness
        float sharpenedBlades = pow(max(0.0, n * bladeLife), uSharpness);
        
        // Background light gradient - uses standard UV for fixed screen position
        float grad = smoothstep(-0.1, 1.1, (uv.x + (1.0 - uv.y)) * 0.5) * bladeLife;
        float mixVal = clamp(grad + sharpenedBlades * uIntensity, 0.0, 1.0);

        // Three-stop color interpolation
        vec3 color = mix(uColorBlack, uColorSteel, smoothstep(0.0, 0.5, mixVal));
        color = mix(color, uColorSilver, smoothstep(0.5, 1.0, mixVal));

        // Refined specular glint
        color += uColorSilver * pow(max(0.0, sharpenedBlades), uSpecPower) * uSpecStrength;

        // Vignette to soften edges - uses standard UV for screen-relative vignette
        float edgeMask = smoothstep(1.5, 0.5, length(uv - vec2(0.5, 1.0)));
        color *= edgeMask;

        gl_FragColor = vec4(color, 1.0);
    }
`;

export default function WorksShader() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        let animationId: number;

        // Init
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const uniforms = {
            uTime: { value: 0 },
            uColorBlack: { value: CONFIG.colors.black },
            uColorSteel: { value: CONFIG.colors.steel },
            uColorSilver: { value: CONFIG.colors.silver },
            uSharpness: { value: CONFIG.bladeSharpness },
            uIntensity: { value: CONFIG.bladeIntensity },
            uSpecPower: { value: CONFIG.specularPower },
            uSpecStrength: { value: CONFIG.specularStrength },
            uFalloffStart: { value: CONFIG.falloffStart },
            uFalloffEnd: { value: CONFIG.falloffEnd },
            uAspect: { value: container.clientWidth / container.clientHeight }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Resize
        const handleResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            const dpr = Math.min(window.devicePixelRatio, 1);

            renderer.setPixelRatio(dpr);
            renderer.setSize(width, height);

            if (material) {
                material.uniforms.uAspect.value = width / height;
            }
        };

        // Initial size
        handleResize();
        window.addEventListener('resize', handleResize);

        // Animate
        let lastTime = performance.now();
        const animate = (now: number) => {
            const delta = (now - lastTime) * 0.001;
            lastTime = now;

            if (material) {
                material.uniforms.uTime.value += delta * CONFIG.speed;
            }
            renderer.render(scene, camera);

            animationId = requestAnimationFrame(animate);
        };

        animate(performance.now());

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);

            if (renderer) {
                renderer.dispose();
                renderer.forceContextLoss();
            }

            if (material) material.dispose();
            if (geometry) geometry.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    useGSAP(() => {
        // Delay to match the reveal animation in page.tsx (2.5s delay + 1s duration)
        const timeout = setTimeout(() => {
            const targets = ["[data-gsap='works-grid']", "[data-gsap='works-freestyle']"];

            targets.forEach(target => {
                ScrollTrigger.create({
                    trigger: target,
                    start: "top top",
                    end: "top+=500 top",
                    scrub: true,
                    animation: gsap.fromTo("[data-gsap='works-shader']",
                        { opacity: 0.35 },
                        { opacity: 0, ease: "linear" }
                    )
                });
            });
            ScrollTrigger.refresh();
        }, 3600);

        return () => {
            clearTimeout(timeout);
            ScrollTrigger.getAll().forEach(t => {
                if (t.vars.trigger === "[data-gsap='works-grid']" || t.vars.trigger === "[data-gsap='works-freestyle']") {
                    t.kill();
                }
            });
        };
    }, []);

    return (
        <div data-gsap="works-shader" ref={containerRef} className="opacity-0 w-full h-[50vh] fixed top-0 left-0" />
    );
}
