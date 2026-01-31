'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import projects from "@/app/data/projects";

import { useStore } from '@/app/useStore';

// --- Configuration ---
const CONFIG = {
    imageHeight: 5.5,
    thickness: 0.021,
    bevelSize: 0.004,
    bevelThickness: 0.02,
    frustumSize: 15,
    idleSpeed: 0.0015,
    baseGlow: 0.2,
    hoverGlow: 1.2,
    liftHeight: 1.8,
    dimOpacity: 0.15,
    activeOpacity: 1.0,
    radius: 1.0,
    roughness: 1.0,
    opacity: 1,
    vigBlur: 49,
    vigInset: 43,
    bloomStrength: 0,
    bloomRadius: 0,
    keyIntensity: 0,
    rimIntensity: 0
};

const INTRO_SETTINGS = {
    duration: 3.5,
    stagger: 0.1,
    revealDuration: 3.5,
    scaleStart: 12.0,
    rotationStart: { x: 35, y: 125, z: 100 },
    baseColor: new THREE.Color(0.15, 0.5, 2.0),
    fringeColor: new THREE.Color(1.0, 1.2, 5.0),
    bloomPeak: 8.0,
    bloomSettle: CONFIG.bloomStrength
};

const PROJECTS = [...projects].sort((a, b) => a.category[0].category.localeCompare(b.category[0].category)).map(p => ({
    title: p.title,
    subtitle: p.category[0].category,
    img: p.gridThumbnail ? p.gridThumbnail : "/assets/project_grid_thumbnails/amca.webp",
    color: p.primaryColor
}));

export default function WorksListGlass({ hoveredIndex, hasPlayed, shouldScale, onReady, paused }: { hoveredIndex?: number | null, hasPlayed: boolean, shouldScale?: boolean, onReady?: () => void, paused?: boolean }) {
    const { isMobile } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const shouldScaleRef = useRef(shouldScale);
    const stateRef = useRef({
        hoveredIndex: -1,
        blades: [] as any[],
        spinVelocity: 0
    });
    const pausedRef = useRef(paused);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        stateRef.current.hoveredIndex = hoveredIndex ?? -1;
    }, [hoveredIndex]);

    useEffect(() => {
        shouldScaleRef.current = shouldScale;
    }, [shouldScale]);

    // Update camera when shouldScale changes
    useEffect(() => {
        if (!cameraRef.current) return;
        const cam = cameraRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const asp = width / height;

        const scalingFactor = shouldScale ? 2.22 : 1.0;
        const fSize = CONFIG.frustumSize * scalingFactor;

        cam.left = -fSize * asp / 2;
        cam.right = fSize * asp / 2;
        cam.top = fSize / 2;
        cam.bottom = -fSize / 2;
        cam.updateProjectionMatrix();

    }, [shouldScale]);

    // Initial effect for Three.js setup
    useEffect(() => {
        if (!containerRef.current) return;

        // --- Helper: Aura Shader ---
        function applyAuraShader(material: THREE.Material) {
            material.userData.reveal = 0;
            material.onBeforeCompile = (shader) => {
                shader.uniforms.uReveal = { get value() { return material.userData.reveal; } };
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uBaseColor = { value: INTRO_SETTINGS.baseColor };
                shader.uniforms.uFringeColor = { value: INTRO_SETTINGS.fringeColor };
                material.userData.shaderRef = shader;

                shader.vertexShader = `
                    varying vec3 vLocalPos;
                    uniform float uReveal;
                    ${shader.vertexShader}
                `.replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>
                     vLocalPos = position;`
                );

                shader.fragmentShader = `
                    uniform float uReveal;
                    uniform float uTime;
                    uniform vec3 uBaseColor;
                    uniform vec3 uFringeColor;
                    varying vec3 vLocalPos;

                    float noise(vec2 p) {
                        return sin(p.x * 3.0 + uTime) * sin(p.y * 2.0 + uTime * 0.5) * 0.25 
                             + sin(p.x * 6.0 - uTime * 1.5) * 0.1;
                    }

                    ${shader.fragmentShader}
                `.replace(
                    '#include <alphamap_fragment>',
                    `#include <alphamap_fragment>
                    
                    float revealHeight = (uReveal * 9.0) - 4.5;
                    float y = vLocalPos.y;
                    float vapor = noise(vLocalPos.xy * 1.2);

                    float introIntensity = 1.0 - smoothstep(0.8, 0.95, uReveal);

                    if (uReveal < 0.998) {
                        float mask = smoothstep(revealHeight + vapor - 0.1, revealHeight + vapor, y);
                        if (mask > 0.99) discard;
                    }

                    float aura = 1.0 - smoothstep(revealHeight + vapor - 2.5, revealHeight + vapor, y);
                    float fringe = smoothstep(revealHeight + vapor - 0.2, revealHeight + vapor - 0.05, y) 
                                 * (1.0 - smoothstep(revealHeight + vapor - 0.05, revealHeight + vapor, y));

                    diffuseColor.rgb += uBaseColor * aura * 1.8 * introIntensity;
                    diffuseColor.rgb += uFringeColor * fringe * 5.0 * introIntensity;
                    `
                );
            };
            material.transparent = true;
            // Key to avoid shader recompilation issues in some Three.js versions
            material.customProgramCacheKey = () => 'aura_final_minimal_v2';
        }

        // --- Initialization ---
        const scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.FogExp2(0x000000, 0.015);
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            powerPreference: "high-performance",
            alpha: true
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(isMobile ? 0.75 : Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const roomEnvironment = new RoomEnvironment();
        scene.environment = pmremGenerator.fromScene(roomEnvironment).texture;

        const aspect = window.innerWidth / window.innerHeight;

        // Initial setup respecting mobile state
        const scalingFactor = shouldScaleRef.current ? 2.22 : 1.0;
        const initFSize = CONFIG.frustumSize * scalingFactor;

        const camera = new THREE.OrthographicCamera(
            initFSize * aspect / -2,
            initFSize * aspect / 2,
            initFSize / 2,
            initFSize / -2,
            1, 1000
        );
        camera.position.set(-35, 30, 35);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const keyLight = new THREE.DirectionalLight(0xffffff, CONFIG.keyIntensity);
        keyLight.position.set(5, 10, 7);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0xffffff, CONFIG.rimIntensity);
        rimLight.position.set(-5, 5, -10);
        scene.add(rimLight);
        const fillLight = new THREE.PointLight(0xffffff, 20.0);
        fillLight.position.set(0, 5, 15);
        scene.add(fillLight);

        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            CONFIG.bloomStrength, CONFIG.bloomRadius, 0.95
        );

        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace,
                samples: 8
            }
        );

        const composer = new EffectComposer(renderer, renderTarget);
        composer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 2));
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        const introPivot = new THREE.Group();
        const carouselGroup = new THREE.Group();
        introPivot.add(carouselGroup);
        scene.add(introPivot);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');

        const vigCanvas = document.createElement('canvas'); vigCanvas.width = 512; vigCanvas.height = 512;
        const vigCtx = vigCanvas.getContext('2d')!;
        const vignetteTexture = new THREE.CanvasTexture(vigCanvas);

        function updateVignette() {
            vigCtx.fillStyle = '#000'; vigCtx.fillRect(0, 0, 512, 512);
            vigCtx.filter = `blur(${CONFIG.vigBlur}px)`;
            vigCtx.fillStyle = '#FFF';
            const ins = CONFIG.vigInset;
            vigCtx.fillRect(ins, ins, 512 - ins * 2, 512 - ins * 2);
            vignetteTexture.needsUpdate = true;
        }
        updateVignette();

        function createGlassGeometry() {
            const s = new THREE.Shape().moveTo(0, -2.25).lineTo(1, -2.25).lineTo(1, 2.25).lineTo(0, 2.25).lineTo(0, -2.25);
            const g = new THREE.ExtrudeGeometry(s, {
                steps: 1, depth: CONFIG.thickness, bevelEnabled: true, bevelThickness: CONFIG.bevelThickness, bevelSize: CONFIG.bevelSize, bevelSegments: isMobile ? 1 : 4
            });
            g.center(); g.translate(0.5, 0, 0);
            return g;
        }

        const glassGeom = createGlassGeometry();
        const planeGeo = new THREE.PlaneGeometry(1, 4.5); planeGeo.translate(0.5, 0, 0);

        // --- Build Blades ---
        const blades: any[] = [];
        PROJECTS.forEach((p, i) => {
            const group = new THREE.Group();

            const faceMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, roughness: CONFIG.roughness, metalness: 0.1, transparent: true, opacity: CONFIG.opacity,
                side: THREE.DoubleSide, envMapIntensity: 2.0, clearcoat: 1.0, clearcoatRoughness: 0.05, depthWrite: false
            });
            applyAuraShader(faceMat);

            const edgeMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.6,
                side: THREE.DoubleSide, envMapIntensity: 1.5, emissive: 0x000000, emissiveIntensity: 0.2
            });
            applyAuraShader(edgeMat);

            const photoMatF = new THREE.MeshBasicMaterial({
                alphaMap: vignetteTexture, transparent: false, side: THREE.FrontSide,
                depthWrite: true, polygonOffset: true, polygonOffsetFactor: -1
            });
            applyAuraShader(photoMatF);

            const photoMatB = new THREE.MeshBasicMaterial({
                alphaMap: vignetteTexture, transparent: false, side: THREE.FrontSide,
                depthWrite: true, polygonOffset: true, polygonOffsetFactor: -1
            });
            applyAuraShader(photoMatB);

            const glassMesh = new THREE.Mesh(glassGeom, [faceMat, edgeMat]);
            glassMesh.renderOrder = 1;
            const pFront = new THREE.Mesh(planeGeo, photoMatF);
            const pBack = new THREE.Mesh(planeGeo, photoMatB);
            pFront.renderOrder = 2; pBack.renderOrder = 2;

            const zOff = (CONFIG.thickness / 2) + CONFIG.bevelThickness + 0.02;
            pFront.position.set(0, 0, zOff);
            pBack.position.set(1, 0, -zOff);
            pBack.rotation.y = Math.PI;

            group.add(glassMesh, pFront, pBack);
            const ang = (i / PROJECTS.length) * Math.PI * 2;
            group.position.set(Math.cos(ang) * CONFIG.radius, 0, Math.sin(ang) * CONFIG.radius);
            group.rotation.y = -ang;
            group.userData = { initialAngle: ang };

            carouselGroup.add(group);

            // Collect references for animation
            blades.push({
                group, glassMesh, faceMat, edgeMat, photoMatF, photoMatB,
                uiBtn: null // will be handled by React state
            });

            loader.load(p.img, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                photoMatF.map = tex;
                photoMatB.map = tex;
                photoMatF.needsUpdate = true;
                photoMatB.needsUpdate = true;

                // Color Extraction for Material Color
                if (p.color) {
                    const domCol = new THREE.Color(p.color);
                    faceMat.color.set(domCol);
                    edgeMat.color.set(domCol);
                    if (tex.image) {
                        group.scale.set(4.5 * (tex.image.width / tex.image.height), 1, 1);
                    }
                } else {
                    const tempC = document.createElement('canvas'); tempC.width = 1; tempC.height = 1;
                    const ctx = tempC.getContext('2d')!;
                    if (tex.image) {
                        ctx.drawImage(tex.image, 0, 0, 1, 1);
                        const d = ctx.getImageData(0, 0, 1, 1).data;
                        const domCol = new THREE.Color(`rgb(${d[0]},${d[1]},${d[2]})`);
                        faceMat.color.set(domCol);
                        edgeMat.color.set(domCol);
                        group.scale.set(4.5 * (tex.image.width / tex.image.height), 1, 1);
                    }
                }
            });
        });

        stateRef.current.blades = blades;

        // --- Intro Engine ---
        function triggerIntro() {
            carouselGroup.rotation.y = 0;
            setIsLoading(false);
            if (onReady) onReady();

            const duration = hasPlayed ? 0 : INTRO_SETTINGS.duration;
            const revealDuration = hasPlayed ? 0 : INTRO_SETTINGS.revealDuration;
            const stagger = hasPlayed ? 0 : INTRO_SETTINGS.stagger;

            blades.forEach(b => {
                [b.faceMat, b.edgeMat, b.photoMatF, b.photoMatB].forEach(m => {
                    m.userData.reveal = 0.0;
                });
            });

            gsap.fromTo(introPivot.scale,
                { x: INTRO_SETTINGS.scaleStart, y: INTRO_SETTINGS.scaleStart, z: INTRO_SETTINGS.scaleStart },
                { x: 1, y: 1, z: 1, duration: duration, ease: "power4.out" }
            );

            const rad = (d: number) => THREE.MathUtils.degToRad(d);
            gsap.fromTo(introPivot.rotation,
                { x: rad(INTRO_SETTINGS.rotationStart.x), y: rad(INTRO_SETTINGS.rotationStart.y), z: rad(INTRO_SETTINGS.rotationStart.z) },
                { x: 0, y: 0, z: 0, duration: duration, ease: "power4.out" }
            );

            blades.forEach((blade, i) => {
                const delay = i * stagger;
                gsap.to([blade.faceMat.userData, blade.edgeMat.userData, blade.photoMatF.userData, blade.photoMatB.userData], {
                    reveal: 1.0, duration: revealDuration, delay: delay, ease: "power2.out"
                });
            });

            gsap.fromTo(bloomPass, { strength: INTRO_SETTINGS.bloomPeak }, { strength: CONFIG.bloomStrength, duration: 0, ease: "power2.out" });

            stateRef.current.spinVelocity = 0.25;
            gsap.to(stateRef.current, { spinVelocity: CONFIG.idleSpeed, duration: duration, ease: "expo.out" });
        }

        // --- Render Loop ---
        const clock = new THREE.Clock();
        let frameId: number;

        function animate() {
            frameId = requestAnimationFrame(animate);
            if (pausedRef.current) return;

            const time = clock.getElapsedTime();
            const state = stateRef.current;

            // Spin
            if (Math.abs(state.spinVelocity - CONFIG.idleSpeed) > 0.0001 && state.spinVelocity !== 0.25) {
                state.spinVelocity += (CONFIG.idleSpeed - state.spinVelocity) * 0.05;
            }
            carouselGroup.rotation.y -= state.spinVelocity;

            state.blades.forEach((b, i) => {
                if (!b.group) return;

                // Sync Uniforms
                [b.faceMat, b.edgeMat, b.photoMatF, b.photoMatB].forEach(m => {
                    if (m && m.userData.shaderRef) m.userData.shaderRef.uniforms.uTime.value = time;
                });

                const isHovered = (i === state.hoveredIndex);
                const float = Math.sin(time * 0.3 + b.group.userData.initialAngle * 2) * 0.1;

                // Vertical Lift
                const targetLift = isHovered ? CONFIG.liftHeight : 0;
                b.group.position.y += (float + targetLift - b.group.position.y) * 0.12;

                // Opacity Dimming
                const targetOpacity = (state.hoveredIndex === -1)
                    ? CONFIG.activeOpacity
                    : (isHovered ? CONFIG.activeOpacity : CONFIG.dimOpacity);

                [b.faceMat, b.edgeMat, b.photoMatF, b.photoMatB].forEach(m => {
                    if (m) m.opacity += (targetOpacity - m.opacity) * 0.15;
                });

                // Emissive feedback
                if (b.edgeMat) {
                    const targetGlow = isHovered ? 1.5 : 0.2;
                    b.edgeMat.emissiveIntensity += (targetGlow - b.edgeMat.emissiveIntensity) * 0.1;
                }
                if (b.faceMat) {
                    const targetEmiss = isHovered ? 0.3 : 0.0;
                    b.faceMat.emissiveIntensity += (targetEmiss - b.faceMat.emissiveIntensity) * 0.1;
                }
            });

            controls.update();
            // composer.render();
            renderer.render(scene, camera);
        }

        animate();
        setTimeout(triggerIntro, 100);


        // --- Resize ---
        const onResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio, 1);
            const asp = width / height;

            // 3D Scaling logic for Mobile
            const scalingFactor = shouldScaleRef.current ? 2.22 : 1.0;
            const fSize = CONFIG.frustumSize * scalingFactor;

            camera.left = -fSize * asp / 2;
            camera.right = fSize * asp / 2;
            camera.top = fSize / 2;
            camera.bottom = -fSize / 2;
            camera.updateProjectionMatrix();

            renderer.setPixelRatio(dpr);
            renderer.setSize(width, height);

            composer.setPixelRatio(dpr);
            composer.setSize(width, height);

            bloomPass.resolution.set(width * dpr, height * dpr);
        };
        window.addEventListener('resize', onResize);

        // --- Cleanup ---
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
            glassGeom.dispose();
            planeGeo.dispose();
            blades.forEach(b => {
                b.faceMat.dispose();
                b.edgeMat.dispose();
                b.photoMatF.dispose();
                b.photoMatB.dispose();
            });
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, []);

    // --- UI Handlers ---
    const setHovered = (index: number) => {
        stateRef.current.hoveredIndex = index;
    };

    const handleReplay = () => {
        window.location.reload();
    };

    return (
        <div className="relative w-screen h-screen bg-transparent overflow-hidden font-sans pointer-events-none brightness-200" data-gsap="works-glass">
            {/* Canvas Container */}
            <div data-gsap="works-glass-canvas" ref={containerRef} style={{ background: "transparent" }} className="absolute top-0 left-0 w-full h-full block" />
        </div>
    );
}
