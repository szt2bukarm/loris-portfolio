'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as CANNON from 'cannon';
import { useStore } from '@/app/useStore';

interface PhysicsKeychainProps {
    modelPath?: string;
}

export default function PhysicsKeychain({ modelPath }: PhysicsKeychainProps) {
    const {isMobile} = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Refs for Three.js and Cannon.js objects
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const worldRef = useRef<CANNON.World | null>(null);
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const animationFrameRef = useRef<number | null>(null);

    // Physics bodies and meshes
    const fixedBodyRef = useRef<CANNON.Body | null>(null);
    const chainBodiesRef = useRef<CANNON.Body[]>([]);
    const chainMeshesRef = useRef<THREE.Mesh[]>([]);
    const keyRingBodyRef = useRef<CANNON.Body | null>(null);
    const keyRingMeshRef = useRef<THREE.Mesh | THREE.Group | null>(null);
    const fingerBodyRef = useRef<CANNON.Body | null>(null);
    const mouseSpringRef = useRef<any>(null); // CANNON.Spring (using any to avoid type issues if archaic)

    // Mouse and interaction
    const mouseRef = useRef(new THREE.Vector2());
    const raycasterRef = useRef(new THREE.Raycaster());
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(1, 0, 0), 0));
    const mouseTargetRef = useRef(new THREE.Vector3());
    const isMouseActiveRef = useRef(false);
    const interactionEnabledRef = useRef(false); // [NEW] Block interactions initially

    // Shader uniforms
    const materialUniformsRef = useRef({
        uProgress: { value: 1.0 },
        uTime: { value: 0.0 },
        uColorA: { value: new THREE.Color(0, 110 / 255, 1) },
        uColorB: { value: new THREE.Color(0, 110 / 255, 1) },
        uGlowParams: { value: new THREE.Vector3(5.0, 12.30, 0.05) },
        uDirection: { value: -1.0 }
    });

    // Transition state
    const transitionTimeRef = useRef(1.0 / 0.15); // Start complete (fully visible)
    const transitionDurationRef = useRef(1.0 / 0.15);

    // Material ref
    const chromeMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const loadedModelDataRef = useRef<any>(null);

    // Constants
    const CHAIN_LENGTH = 9;
    const LINK_RADIUS = 0.25;
    const LINK_TUBE = 0.06;
    const LINK_LENGTH = 0.6;
    const PHYS_TUBE = 0.03;
    const KEYRING_RADIUS = 4.0;
    const KEYRING_TUBE = 0.08;
    const PIVOT_OFFSET = LINK_LENGTH / 2;
    const LINK_MASS = 0.15;
    const FIXED_POINT = new THREE.Vector3(0, 11, 0);
    const TIME_STEP = 1 / 60; // Back to standard 60hz for performance
    const LINK_DAMPING = 0.3;
    const OBJECT_TARGET_HEIGHT = 8.0;
    const OBJECT_MASS = 2.0;

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize scene
        const scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x000000); // Removed for transparency
        // scene.fog = new THREE.FogExp2(0x000000, 0.02); // Removed for transparency
        sceneRef.current = scene;

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / Math.max(window.innerWidth < 1280 ? window.innerHeight / 1.5 : window.innerHeight, 750),
            0.1,
            1000
        );
        camera.position.set(22, 0, 0);
        camera.lookAt(0, 3, 0);
        cameraRef.current = camera;

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Alpha true for transparency, [FIX] Disable AA for performance

        // Initial size calculation matching handleResize
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const baseWidth = width < 1280 ? height / 1.5 : height;
        const initialHeight = Math.max(baseWidth, 750);

        renderer.setSize(width, initialHeight);
        renderer.setPixelRatio(isMobile ? 1 : window.devicePixelRatio);
        renderer.shadowMap.enabled = !isMobile;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2.0; // [USER] Adjust global brightness here (default: 1.0)
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        canvasRef.current = renderer.domElement;

        // Lighting - intensities boosted 100x+ for physical units in newer Three.js
        const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // [USER] Ambient light intensity
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 10000); // [USER] Key light intensity
        spotLight.position.set(10, 20, 10);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.bias = -0.0001;
        scene.add(spotLight);

        const rimLight = new THREE.SpotLight(0xddeeff, 4000); // [USER] Rim light intensity
        rimLight.position.set(-10, 10, -5);
        rimLight.lookAt(0, -5, 0);
        scene.add(rimLight);

        const fillLight = new THREE.PointLight(0x0082f7, 600); // [USER] Fill light intensity (less orange)
        fillLight.position.set(5, -10, 5);
        scene.add(fillLight);

        ambientLight.intensity = isMobile ? 1.0 : 3.0;
        spotLight.intensity = isMobile ? 3000 : 10000;
        rimLight.intensity = isMobile ? 1000 : 4000;
        fillLight.intensity = isMobile ? 200 : 600;

        // Environment map
        // const cubeTextureLoader = new THREE.CubeTextureLoader();
        // const envMap = cubeTextureLoader.load([
        //     'https://placehold.co/512x512/111111/222222?text=+',
        //     'https://placehold.co/512x512/111111/222222?text=-',
        //     'https://placehold.co/512x512/333333/555555?text=Light',
        //     'https://placehold.co/512x512/000000/111111?text=Floor',
        //     'https://placehold.co/512x512/111111/222222?text=L',
        //     'https://placehold.co/512x512/111111/222222?text=R'
        // ]);
        // scene.environment = envMap;

        // Chrome material with shader
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 1.0,
            roughness: 0.2,
            // envMap: envMap,
            envMapIntensity: 0.8
        });

        chromeMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uProgress = materialUniformsRef.current.uProgress;
            shader.uniforms.uTime = materialUniformsRef.current.uTime;
            shader.uniforms.uColorA = materialUniformsRef.current.uColorA;
            shader.uniforms.uColorB = materialUniformsRef.current.uColorB;
            shader.uniforms.uGlowParams = materialUniformsRef.current.uGlowParams;
            shader.uniforms.uDirection = materialUniformsRef.current.uDirection;

            shader.vertexShader = `
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
            );

            shader.fragmentShader = `
        uniform float uProgress;
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uGlowParams;
        uniform float uDirection;
        varying vec3 vWorldPosition;
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        ${shader.fragmentShader}
      `.replace(
                '#include <dithering_fragment>',
                `
        #include <dithering_fragment>
        
        // Only apply scan effect if progress is not complete
        if (uProgress < 0.99) {
            float glowThickness = uGlowParams.x;
            float glowIntensity = uGlowParams.y;
            float glitchStr = uGlowParams.z;
            float scanBase = (uDirection < 0.0) ? 15.0 - (uProgress * 30.0) : -15.0 + (uProgress * 30.0);
            float n1 = sin(vWorldPosition.x * 2.5 + uTime * 1.5) * cos(vWorldPosition.z * 2.5 + uTime * 1.2);
            float n2 = sin(vWorldPosition.x * 12.0 - uTime * 4.0) * 0.08;
            float glitch = hash(floor(vWorldPosition.y * 8.0) + uTime) * glitchStr * step(0.92, hash(uTime * 0.5));
            float limit = scanBase + n1 * 0.45 + n2 + glitch;
            bool isVisible = (uDirection < 0.0) ? (vWorldPosition.y > limit) : (vWorldPosition.y < limit);
            if (!isVisible) discard;
            float dist = abs(vWorldPosition.y - limit);
            if (dist < glowThickness) {
                float edge = 1.0 - (dist / glowThickness);
                float flicker = 0.85 + 0.15 * sin(uTime * 25.0);
                float pulse = pow(edge, 3.5) * flicker;
                float gradMix = sin(vWorldPosition.y * 1.5 + uTime) * 0.5 + 0.5;
                vec3 finalGlow = mix(uColorA, uColorB, gradMix);
                gl_FragColor.rgb += finalGlow * pulse * glowIntensity;
                if (hash(vWorldPosition.x * 15.0 + vWorldPosition.y * 15.0 + uTime) > 0.985) gl_FragColor.rgb += vec3(1.0) * pulse * 12.0;
            }
        }
        `
            );
        };

        chromeMaterialRef.current = chromeMaterial;

        // Initialize physics world
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.SAPBroadphase(world); // [FIX] Efficient collision detection
        world.solver.iterations = 50; // [FIX] Increased from 50 to 75 for better rigidity (safe for CPU)
        world.solver.tolerance = 0.1;
        worldRef.current = world;

        const chainMat = new CANNON.Material('chainMaterial');
        world.addContactMaterial(
            new CANNON.ContactMaterial(chainMat, chainMat, {
                friction: 0.2,
                restitution: 0.0
            })
        );

        // Finger body setup (Dynamic now, connected to mouse via spring)
        fingerBodyRef.current = null;
        const mouseBody = new CANNON.Body({
            mass: 0, // Static/Kinematic anchor for mouse
            type: CANNON.Body.KINEMATIC,
            position: new CANNON.Vec3(0, 0, 0)
        });
        mouseBody.collisionFilterGroup = 0; // Disable collision for the mouse anchor itself
        world.addBody(mouseBody);
        // We need to store mouseBody in a ref to update it in animate
        // Adding a temp ref on the fly or just closure? Closure is fine for animate loop defined here.
        // But we need it in handleMouseMove? handleMouseMove just updates mouseTargetRef.
        // animate updates mouseBody.position.

        // Wait, we need to access mouseBody in animate.
        // Let's store it in a Ref? Or just closure variable 'mouseBody' is accessible in animate() defined below?
        // Yes, 'mouseBody' is in scope for 'animate'.

        let mouseConstraint: any = null; // Removing usage, keeping only if needed for cleanup? No.

        // Build chain
        // Build chain (only if no model path is provided initially, otherwise wait for load)
        if (!modelPath) {
            buildChainSimulation();
        }

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            const delta = clockRef.current.getDelta();

            // Update shader transition
            if (transitionTimeRef.current < transitionDurationRef.current) {
                transitionTimeRef.current += delta;
                const t = Math.min(1.0, transitionTimeRef.current / transitionDurationRef.current);
                const eased = t === 1.0 ? 1.0 : 1.0 - Math.pow(2.0, -7.0 * t);
                materialUniformsRef.current.uProgress.value = eased;
            }
            materialUniformsRef.current.uTime.value += delta;

            // Update mouse body position (Kinematic Anchor)
            if (isMouseActiveRef.current) {
                // Move the hidden mouse anchor to the raycast target
                mouseBody.position.set(0, mouseTargetRef.current.y, mouseTargetRef.current.z);
            }

            // Apply spring force manually if spring exists
            if (mouseSpringRef.current) {
                mouseSpringRef.current.applyForce();
            }

            // Note: fingerBodyRef is now dynamic. We don't manually set its position.
            // Theoretical manual clamping or damping could go here if needed.

            // Step physics
            const speedFactor = isMobile ? 2.5 : 0;
            world.step(TIME_STEP, delta * speedFactor);

            // Update mesh positions
            chainMeshesRef.current.forEach((m, i) => {
                const body = chainBodiesRef.current[i];
                m.position.copy(body.position as any);
                m.quaternion.copy(body.quaternion as any);
            });

            if (keyRingMeshRef.current && keyRingBodyRef.current) {
                keyRingMeshRef.current.position.copy(keyRingBodyRef.current.position as any);
                keyRingMeshRef.current.quaternion.copy(keyRingBodyRef.current.quaternion as any);

                const e = new CANNON.Vec3();
                keyRingBodyRef.current.quaternion.toEuler(e);
                let y = e.y % (2 * Math.PI);
                if (y > Math.PI) y -= 2 * Math.PI;
                if (y < -Math.PI) y += 2 * Math.PI;
                keyRingBodyRef.current.torque.y += -2.0 * y - 0.5 * keyRingBodyRef.current.angularVelocity.y;
            }

            renderer.render(scene, camera);
        };

        animate();
        setIsReady(true);

        // Event handlers
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            const baseWidth = width < 1280 ? height / 1.5 : height;

            cameraRef.current.aspect = width / Math.max(baseWidth, 750);
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, Math.max(baseWidth, 750));
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!interactionEnabledRef.current) return;
            isMouseActiveRef.current = true;
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
            raycasterRef.current.ray.intersectPlane(planeRef.current, mouseTargetRef.current);

            // Lazy creation of dynamic finger body
            if (!fingerBodyRef.current && worldRef.current) {
                // Initialize mouseBody position to avoid snap
                mouseBody.position.set(0, mouseTargetRef.current.y, mouseTargetRef.current.z);

                const fingerBody = new CANNON.Body({
                    mass: 1, // [FIX] Reduced mass for snappier response (less inertia)
                    position: new CANNON.Vec3(0, mouseTargetRef.current.y, mouseTargetRef.current.z),
                    linearDamping: 0.5,
                    angularDamping: 0.5
                });
                fingerBody.addShape(new CANNON.Sphere(0.5));
                worldRef.current.addBody(fingerBody);
                fingerBodyRef.current = fingerBody;

                // Create spring between mouseBody (cursor) and fingerBody (physical finger)
                // In Cannon 0.6.2, Spring is a separate class, not a constraint
                const spring = new CANNON.Spring(mouseBody, fingerBody, {
                    localAnchorA: new CANNON.Vec3(0, 0, 0),
                    localAnchorB: new CANNON.Vec3(0, 0, 0),
                    restLength: 0.5,
                    stiffness: 15, // [FIX] Increased stiffness for less delay
                    damping: 0.5,
                });
                mouseSpringRef.current = spring;
                // Note: Springs are not added to world.constraints. They are applied manually in step/postStep.
            }
        };

        window.addEventListener('resize', handleResize);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);

        // Helper function: Build chain simulation
        function buildChainSimulation() {
            const world = worldRef.current!;
            const scene = sceneRef.current!;

            if (fixedBodyRef.current) world.removeBody(fixedBodyRef.current);
            chainBodiesRef.current.forEach((b) => world.removeBody(b));
            chainMeshesRef.current.forEach((m) => scene.remove(m));
            if (keyRingBodyRef.current) world.removeBody(keyRingBodyRef.current);
            if (keyRingMeshRef.current) scene.remove(keyRingMeshRef.current);

            chainBodiesRef.current = [];
            chainMeshesRef.current = [];

            const fixedBody = new CANNON.Body({
                mass: 0,
                position: new CANNON.Vec3(FIXED_POINT.x, FIXED_POINT.y, FIXED_POINT.z)
            });
            world.addBody(fixedBody);
            fixedBodyRef.current = fixedBody;

            // Initialize geometry
            const linkGeometry = new THREE.TorusGeometry(LINK_RADIUS, LINK_TUBE, isMobile ? 4 : 16, isMobile ? 12 : 50);
            linkGeometry.scale(1, LINK_LENGTH / (LINK_RADIUS * 2), 1);

            const sideBarShape = new CANNON.Box(new CANNON.Vec3(PHYS_TUBE, LINK_LENGTH / 2, PHYS_TUBE));
            const endCapShape = new CANNON.Box(new CANNON.Vec3(LINK_RADIUS, PHYS_TUBE, PHYS_TUBE));

            let lastBody = fixedBody;
            let lastY = FIXED_POINT.y;

            for (let i = 0; i < CHAIN_LENGTH; i++) {
                const isOdd = i % 2 !== 0;
                lastY -= LINK_LENGTH * 0.85;

                const body = new CANNON.Body({
                    mass: LINK_MASS,
                    position: new CANNON.Vec3(FIXED_POINT.x, lastY, FIXED_POINT.z),
                    linearDamping: LINK_DAMPING,
                    angularDamping: LINK_DAMPING
                });

                const q = new CANNON.Quaternion();
                if (!isOdd) q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
                body.quaternion.copy(q);

                body.addShape(sideBarShape, new CANNON.Vec3(-LINK_RADIUS, 0, 0));
                body.addShape(sideBarShape, new CANNON.Vec3(LINK_RADIUS, 0, 0));
                body.addShape(endCapShape, new CANNON.Vec3(0, LINK_LENGTH / 2, 0));
                body.addShape(endCapShape, new CANNON.Vec3(0, -LINK_LENGTH / 2, 0));

                world.addBody(body);
                chainBodiesRef.current.push(body);

                const mesh = new THREE.Mesh(linkGeometry, chromeMaterialRef.current!);
                mesh.castShadow = true;
                scene.add(mesh);
                chainMeshesRef.current.push(mesh);

                if (i === 0) {
                    world.addConstraint(
                        new CANNON.HingeConstraint(fixedBody, body, {
                            pivotA: new CANNON.Vec3(0, 0, 0),
                            axisA: new CANNON.Vec3(0, 1, 0),
                            pivotB: new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                            axisB: new CANNON.Vec3(0, 1, 0),
                            maxForce: 1e9
                        })
                    );
                } else {
                    world.addConstraint(
                        new CANNON.PointToPointConstraint(
                            lastBody,
                            new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                            body,
                            new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                            1e9
                        )
                    );
                }

                lastBody = body;
            }

            if (loadedModelDataRef.current) {
                buildCustomObject(lastBody, lastY, loadedModelDataRef.current);
            } else {
                buildPlaceholderObject(lastBody, lastY);
            }
        }

        function buildPlaceholderObject(lastBody: CANNON.Body, startY: number) {
            const world = worldRef.current!;
            const scene = sceneRef.current!;

            const keyRingBody = new CANNON.Body({
                mass: OBJECT_MASS,
                linearDamping: LINK_DAMPING,
                angularDamping: LINK_DAMPING
            });

            const posY = startY - (LINK_LENGTH / 2 + KEYRING_RADIUS);
            keyRingBody.position.set(FIXED_POINT.x, posY, FIXED_POINT.z);
            keyRingBody.addShape(new CANNON.Box(new CANNON.Vec3(KEYRING_RADIUS, KEYRING_RADIUS, 0.2)));
            world.addBody(keyRingBody);
            keyRingBodyRef.current = keyRingBody;

            const keyRingMesh = new THREE.Mesh(
                new THREE.TorusGeometry(KEYRING_RADIUS, KEYRING_TUBE, isMobile ? 1 : 16, isMobile ? 5 : 100),
                chromeMaterialRef.current!
            );
            scene.add(keyRingMesh);
            keyRingMeshRef.current = keyRingMesh;

            world.addConstraint(
                new CANNON.PointToPointConstraint(
                    lastBody,
                    new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                    keyRingBody,
                    new CANNON.Vec3(0, KEYRING_RADIUS, 0),
                    1e9
                )
            );
        }

        function buildCustomObject(lastBody: CANNON.Body, startY: number, modelData: any) {
            const world = worldRef.current!;
            const scene = sceneRef.current!;

            const { object, size, center } = modelData;

            const keyRingBody = new CANNON.Body({
                mass: OBJECT_MASS,
                linearDamping: LINK_DAMPING,
                angularDamping: LINK_DAMPING
            });

            keyRingBody.addShape(
                new CANNON.Box(new CANNON.Vec3(size.x * 0.5, size.y * 0.35, size.z * 0.5)),
                new CANNON.Vec3(0, -size.y * 0.15, 0)
            );

            const constraintY = size.y * 0.48;
            keyRingBody.position.set(
                FIXED_POINT.x,
                startY - PIVOT_OFFSET * 0.85 - constraintY,
                FIXED_POINT.z
            );
            world.addBody(keyRingBody);
            keyRingBodyRef.current = keyRingBody;

            const container = new THREE.Group();
            const clonedObj = object.clone();
            clonedObj.traverse((child: any) => {
                if (child.isMesh) {
                    child.material = chromeMaterialRef.current;
                    child.castShadow = true;
                }
            });

            const wrapper = new THREE.Group();
            wrapper.add(clonedObj);
            clonedObj.position.sub(center);
            wrapper.rotation.y = Math.PI / 2;
            container.add(wrapper);
            scene.add(container);
            keyRingMeshRef.current = container;

            world.addConstraint(
                new CANNON.PointToPointConstraint(
                    lastBody,
                    new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                    keyRingBody,
                    new CANNON.Vec3(0, constraintY, 0),
                    1e9
                )
            );
        }

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current?.domElement) {
                rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    // Load model from path if provided
    useEffect(() => {
        if (modelPath) {
            loadCustomObject(modelPath, modelPath);

            // [NEW] Enable interaction after animation delay (2.5s)
            setTimeout(() => {
                interactionEnabledRef.current = true;
            }, 1500);
        }
    }, [modelPath]);

    // Handle trigger button
    const handleTrigger = () => {
        transitionTimeRef.current = 0;
        materialUniformsRef.current.uProgress.value = 0.0;
        simulateTransition();
    };

    const simulateTransition = () => {
        if (!worldRef.current) return;

        // Reset chain
        const world = worldRef.current;
        const scene = sceneRef.current!;

        if (fixedBodyRef.current) world.removeBody(fixedBodyRef.current);
        chainBodiesRef.current.forEach((b) => world.removeBody(b));
        chainMeshesRef.current.forEach((m) => scene.remove(m));
        if (keyRingBodyRef.current) world.removeBody(keyRingBodyRef.current);
        if (keyRingMeshRef.current) scene.remove(keyRingMeshRef.current);

        chainBodiesRef.current = [];
        chainMeshesRef.current = [];

        const fixedBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(FIXED_POINT.x, FIXED_POINT.y, FIXED_POINT.z)
        });
        world.addBody(fixedBody);
        fixedBodyRef.current = fixedBody;

        const linkGeometry = new THREE.TorusGeometry(LINK_RADIUS, LINK_TUBE, 8, 24); // [FIX] Low poly for performance
        linkGeometry.scale(1, LINK_LENGTH / (LINK_RADIUS * 2), 1);

        const sideBarShape = new CANNON.Box(new CANNON.Vec3(PHYS_TUBE, LINK_LENGTH / 2, PHYS_TUBE));
        const endCapShape = new CANNON.Box(new CANNON.Vec3(LINK_RADIUS, PHYS_TUBE, PHYS_TUBE));

        let lastBody = fixedBody;
        let lastY = FIXED_POINT.y;

        for (let i = 0; i < CHAIN_LENGTH; i++) {
            const isOdd = i % 2 !== 0;
            lastY -= LINK_LENGTH * 0.85;

            const body = new CANNON.Body({
                mass: LINK_MASS,
                position: new CANNON.Vec3(FIXED_POINT.x, lastY, FIXED_POINT.z),
                linearDamping: LINK_DAMPING,
                angularDamping: LINK_DAMPING
            });

            const q = new CANNON.Quaternion();
            if (!isOdd) q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            body.quaternion.copy(q);

            body.addShape(sideBarShape, new CANNON.Vec3(-LINK_RADIUS, 0, 0));
            body.addShape(sideBarShape, new CANNON.Vec3(LINK_RADIUS, 0, 0));
            body.addShape(endCapShape, new CANNON.Vec3(0, LINK_LENGTH / 2, 0));
            body.addShape(endCapShape, new CANNON.Vec3(0, -LINK_LENGTH / 2, 0));

            world.addBody(body);
            chainBodiesRef.current.push(body);

            const mesh = new THREE.Mesh(linkGeometry, chromeMaterialRef.current!);
            mesh.castShadow = true;
            scene.add(mesh);
            chainMeshesRef.current.push(mesh);

            if (i === 0) {
                world.addConstraint(
                    new CANNON.HingeConstraint(fixedBody, body, {
                        pivotA: new CANNON.Vec3(0, 0, 0),
                        axisA: new CANNON.Vec3(0, 1, 0),
                        pivotB: new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                        axisB: new CANNON.Vec3(0, 1, 0),
                        maxForce: 1e9
                    })
                );
            } else {
                world.addConstraint(
                    new CANNON.PointToPointConstraint(
                        lastBody,
                        new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                        body,
                        new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                        1e9
                    )
                );
            }

            lastBody = body;
        }

        if (loadedModelDataRef.current) {
            buildCustomObjectForTransition(lastBody, lastY, loadedModelDataRef.current);
        } else {
            buildPlaceholderObjectForTransition(lastBody, lastY);
        }

        // Apply forces
        const SWING_FORCE = 6;
        chainBodiesRef.current.forEach((body) => {
            body.velocity.set(-SWING_FORCE, 0, 0);
            body.angularVelocity.set(0, 0, SWING_FORCE * 0.15);
        });

        if (keyRingBodyRef.current) {
            keyRingBodyRef.current.velocity.set(-SWING_FORCE * 1.5, 0, 0);
            keyRingBodyRef.current.angularVelocity.set(0, 0, SWING_FORCE * 0.08);
        }
    };

    function buildPlaceholderObjectForTransition(lastBody: CANNON.Body, startY: number) {
        const world = worldRef.current!;
        const scene = sceneRef.current!;

        const keyRingBody = new CANNON.Body({
            mass: OBJECT_MASS,
            linearDamping: LINK_DAMPING,
            angularDamping: LINK_DAMPING
        });

        const posY = startY - (LINK_LENGTH / 2 + KEYRING_RADIUS);
        keyRingBody.position.set(FIXED_POINT.x, posY, FIXED_POINT.z);
        keyRingBody.addShape(new CANNON.Box(new CANNON.Vec3(KEYRING_RADIUS, KEYRING_RADIUS, 0.2)));
        world.addBody(keyRingBody);
        keyRingBodyRef.current = keyRingBody;

        const keyRingMesh = new THREE.Mesh(
            new THREE.TorusGeometry(KEYRING_RADIUS, KEYRING_TUBE, 16, 100),
            chromeMaterialRef.current!
        );
        scene.add(keyRingMesh);
        keyRingMeshRef.current = keyRingMesh;

        world.addConstraint(
            new CANNON.PointToPointConstraint(
                lastBody,
                new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                keyRingBody,
                new CANNON.Vec3(0, KEYRING_RADIUS, 0),
                1e9
            )
        );
    }

    function buildCustomObjectForTransition(lastBody: CANNON.Body, startY: number, modelData: any) {
        const world = worldRef.current!;
        const scene = sceneRef.current!;

        const { object, size, center } = modelData;

        const keyRingBody = new CANNON.Body({
            mass: OBJECT_MASS,
            linearDamping: LINK_DAMPING,
            angularDamping: LINK_DAMPING
        });

        keyRingBody.addShape(
            new CANNON.Box(new CANNON.Vec3(size.x * 0.5, size.y * 0.35, size.z * 0.5)),
            new CANNON.Vec3(0, -size.y * 0.15, 0)
        );

        const constraintY = size.y * 0.48;
        keyRingBody.position.set(
            FIXED_POINT.x,
            startY - PIVOT_OFFSET * 0.85 - constraintY,
            FIXED_POINT.z
        );
        world.addBody(keyRingBody);
        keyRingBodyRef.current = keyRingBody;

        const container = new THREE.Group();
        const clonedObj = object.clone();
        clonedObj.traverse((child: any) => {
            if (child.isMesh) {
                child.material = chromeMaterialRef.current;
                child.castShadow = true;
            }
        });

        const wrapper = new THREE.Group();
        wrapper.add(clonedObj);
        clonedObj.position.sub(center);
        wrapper.rotation.y = Math.PI / 2;
        container.add(wrapper);
        scene.add(container);
        keyRingMeshRef.current = container;

        world.addConstraint(
            new CANNON.PointToPointConstraint(
                lastBody,
                new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                keyRingBody,
                new CANNON.Vec3(0, constraintY, 0),
                1e9
            )
        );
    }



    const loadCustomObject = (url: string, filename: string) => {
        const ext = filename ? filename.split('.').pop()?.toLowerCase() : 'obj';
        let loader: GLTFLoader | OBJLoader =
            ext === 'glb' || ext === 'gltf' ? new GLTFLoader() : new OBJLoader();

        if (loader instanceof GLTFLoader) {
            const draco = new DRACOLoader();
            draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            loader.setDRACOLoader(draco);
        }

        loader.load(url, (data: any) => {
            let object = data.scene || data;
            let hasMesh = false;
            object.traverse((child: any) => {
                if (child.isMesh) hasMesh = true;
            });
            if (!hasMesh) return;

            const box = new THREE.Box3().setFromObject(object);
            const size = new THREE.Vector3();
            box.getSize(size);
            if (isNaN(size.x) || size.lengthSq() < 0.0001) return;

            const scale = OBJECT_TARGET_HEIGHT / size.y;
            object.scale.set(scale, scale, scale);

            box.setFromObject(object);
            const center = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);

            loadedModelDataRef.current = { object, size, center };

            // Reset everything on new load
            transitionTimeRef.current = 0;
            materialUniformsRef.current.uProgress.value = 0.0;

            // Rebuild chain with new model
            if (worldRef.current && sceneRef.current) {
                const world = worldRef.current;
                const scene = sceneRef.current;

                if (fixedBodyRef.current) world.removeBody(fixedBodyRef.current);
                chainBodiesRef.current.forEach((b) => world.removeBody(b));
                chainMeshesRef.current.forEach((m) => scene.remove(m));
                if (keyRingBodyRef.current) world.removeBody(keyRingBodyRef.current);
                if (keyRingMeshRef.current) scene.remove(keyRingMeshRef.current);

                chainBodiesRef.current = [];
                chainMeshesRef.current = [];

                const fixedBody = new CANNON.Body({
                    mass: 0,
                    position: new CANNON.Vec3(FIXED_POINT.x, FIXED_POINT.y, FIXED_POINT.z)
                });
                world.addBody(fixedBody);
                fixedBodyRef.current = fixedBody;

                const linkGeometry = new THREE.TorusGeometry(LINK_RADIUS, LINK_TUBE, 8, 24); // [FIX] Low poly for performance
                linkGeometry.scale(1, LINK_LENGTH / (LINK_RADIUS * 2), 1);

                const sideBarShape = new CANNON.Box(new CANNON.Vec3(PHYS_TUBE, LINK_LENGTH / 2, PHYS_TUBE));
                const endCapShape = new CANNON.Box(new CANNON.Vec3(LINK_RADIUS, PHYS_TUBE, PHYS_TUBE));

                let lastBody = fixedBody;
                let lastY = FIXED_POINT.y;

                const SWING_OFFSET = 0;
                const INITIAL_VELOCITY = -5;

                for (let i = 0; i < CHAIN_LENGTH; i++) {
                    const isOdd = i % 2 !== 0;
                    lastY -= LINK_LENGTH * 0.85;

                    const body = new CANNON.Body({
                        mass: LINK_MASS,
                        position: new CANNON.Vec3(FIXED_POINT.x - SWING_OFFSET, lastY, FIXED_POINT.z - SWING_OFFSET),
                        linearDamping: LINK_DAMPING,
                        angularDamping: LINK_DAMPING
                    });

                    // Initial impulse to show interaction
                    body.velocity.set(INITIAL_VELOCITY, 0, INITIAL_VELOCITY);

                    const q = new CANNON.Quaternion();
                    if (!isOdd) q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
                    body.quaternion.copy(q);

                    body.addShape(sideBarShape, new CANNON.Vec3(-LINK_RADIUS, 0, 0));
                    body.addShape(sideBarShape, new CANNON.Vec3(LINK_RADIUS, 0, 0));
                    body.addShape(endCapShape, new CANNON.Vec3(0, LINK_LENGTH / 2, 0));
                    body.addShape(endCapShape, new CANNON.Vec3(0, -LINK_LENGTH / 2, 0));

                    world.addBody(body);
                    chainBodiesRef.current.push(body);

                    const mesh = new THREE.Mesh(linkGeometry, chromeMaterialRef.current!);
                    mesh.castShadow = true;
                    scene.add(mesh);
                    chainMeshesRef.current.push(mesh);

                    if (i === 0) {
                        world.addConstraint(
                            new CANNON.HingeConstraint(fixedBody, body, {
                                pivotA: new CANNON.Vec3(0, 0, 0),
                                axisA: new CANNON.Vec3(0, 1, 0),
                                pivotB: new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                                axisB: new CANNON.Vec3(0, 1, 0),
                                maxForce: 1e9
                            })
                        );
                    } else {
                        world.addConstraint(
                            new CANNON.PointToPointConstraint(
                                lastBody,
                                new CANNON.Vec3(0, -PIVOT_OFFSET * 0.85, 0),
                                body,
                                new CANNON.Vec3(0, PIVOT_OFFSET * 0.85, 0),
                                1e9
                            )
                        );
                    }

                    lastBody = body;
                }

                buildCustomObjectForTransition(lastBody, lastY, loadedModelDataRef.current);

                // Also apply force to the main object
                if (keyRingBodyRef.current) {
                    keyRingBodyRef.current.velocity.set(INITIAL_VELOCITY, 0, INITIAL_VELOCITY);
                }
            }

            URL.revokeObjectURL(url);
        });
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0,
                overflow: 'hidden',
                backgroundColor: 'transparent', // Transparent background
                fontFamily: "'Inter', -apple-system, sans-serif",
                height: '100%',
                width: '100%'
            }}
        >
            <div
                ref={containerRef}
                style={{
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}
            />
        </div>
    );
}
