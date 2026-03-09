import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { simFragmentShader, particleVertexShader, particleFragmentShader } from './shaders';

gsap.registerPlugin(ScrollTrigger);

export function initGPGPUParticles() {
    // 1 Million particles = 1000x1000 texture
    const WIDTH = 1000;
    const PARTICLES = WIDTH * WIDTH;

    // Create a new canvas and scene for the background
    const container = document.createElement('div');
    container.id = 'gpgpu-canvas-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '-1'; // Behind everything
    container.style.pointerEvents = 'none'; // Don't block clicks
    document.body.appendChild(container);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03030a, 0.05);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    // --- GPU Computation Setup ---
    const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    if (!renderer.capabilities.isWebGL2) {
        gpuCompute.setDataType(THREE.HalfFloatType);
    }

    // Initialize random positions
    const dtPosition = gpuCompute.createTexture();
    const posArray = dtPosition.image.data;
    if (posArray) {
        for (let i = 0; i < posArray.length; i += 4) {
            // Random spread
            posArray[i + 0] = (Math.random() - 0.5) * 60; // x
            posArray[i + 1] = (Math.random() - 0.5) * 60; // y
            posArray[i + 2] = (Math.random() - 0.5) * 60; // z
            posArray[i + 3] = 1;                          // w
        }
    }

    const positionVariable = gpuCompute.addVariable('texturePosition', simFragmentShader, dtPosition);
    positionVariable.material.uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uMorphState: { value: 0 },
        textureTargetScan: { value: null },
        textureTargetGraph: { value: null }
    };
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);
    
    const error = gpuCompute.init();
    if (error !== null) {
        console.error("GPGPU init error: ", error);
    }

    // --- Create 1 Million Point Mesh ---
    const geometry = new THREE.BufferGeometry();
    const uvArray = new Float32Array(PARTICLES * 2);
    let p = 0;
    // Pass UVs to map which particle reads from which pixel of the FBO texture
    for (let j = 0; j < WIDTH; j++) {
        for (let i = 0; i < WIDTH; i++) {
            uvArray[p++] = i / (WIDTH - 1);
            uvArray[p++] = j / (WIDTH - 1);
        }
    }
    
    // We use "position" buffer attribute to store UVs, as the real position comes from the texture
    geometry.setAttribute('position', new THREE.BufferAttribute(uvArray, 2));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            texturePosition: { value: null }, // Updated every frame
            uSize: { value: 4.0 }
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending // Holographic glow
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Interactivity (Repulsion) ---
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    const target = new THREE.Vector3();

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, target);
        positionVariable.material.uniforms.uMouse.value.copy(target);
    });

    // --- Morphing Logic (ScrollTrigger) ---
    // Smooth transition between forms based on scroll
    gsap.to(positionVariable.material.uniforms.uMorphState, {
        value: 2.0, 
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Fluid smoothing
        }
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    
    const tick = () => {
        const elapsed = clock.getElapsedTime();
        positionVariable.material.uniforms.uTime.value = elapsed;

        // 1. Compute particle physics on the GPU
        gpuCompute.compute();
        
        // 2. Pass computed positions to Particle Material
        material.uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;

        // 3. Render
        renderer.render(scene, camera);
        
        requestAnimationFrame(tick);
    };
    
    tick();
}