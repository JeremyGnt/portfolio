import * as THREE from 'three';
import Lenis from 'lenis';

interface SyncItem {
    element: HTMLElement;
    mesh: THREE.Mesh;
    bounds: DOMRect;
    initialY: number;
}

export class DOMWebGLSync {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private lenis!: Lenis;
    private items: SyncItem[] = [];
    private scrollData = { current: 0, target: 0, last: 0, velocity: 0 };
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private geometry: THREE.PlaneGeometry;
    private isInteracting: boolean = false;
    private activeItem: SyncItem | null = null;
    
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // High segment count for cylinder distortion!
        this.geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
        
        this.initLenis();
        this.setupItems();
        this.setupEventListeners();
        
        // Render loop is usually handled in main.ts, but we expose a sync update method.
    }

    private initLenis() {
        this.lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
        });

        this.lenis.on('scroll', (e: any) => {
            this.scrollData.current = e.animatedScroll;
            this.scrollData.velocity = e.velocity;
        });

        // Request animation frame for Lenis
        gsap.ticker.add((time)=>{
            this.lenis.raf(time * 1000);
        });
    }

    public syncCameraFov() {
        // Essential calculation! Matches 1 WebGL unit to 1 CSS pixel at z=0.
        // Formula: fov = 2 * Math.atan( (window.innerHeight / 2) / zPosition ) * (180 / Math.PI)
        const distance = this.camera.position.z;
        this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    private setupItems() {
        const elements = document.querySelectorAll('.webgl-image-placeholder');
        
        // Basic cylinder distortion shader
        const vertexShader = `
            uniform float uHover;
            uniform float uScrollVelocity;
            uniform float uTime;
            uniform float uActive; // 1.0 if clicked
            varying vec2 vUv;
            
            #define PI 3.14159265359

            void main() {
                vUv = uv;
                
                vec3 pos = position;
                
                // Cylinder effect on scroll! Projecting as a scrollable wheel
                // Bend the edges back
                float distanceFromCenter = (pos.y + 0.5); // 0 to 1
                pos.z += sin(pos.y * PI) * uScrollVelocity * 0.1; 
                
                // Active detach effect
                pos.z += uActive * 300.0 * (1.0 - abs(pos.x)); 
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            uniform vec3 uColor;
            uniform float uHover;
            uniform float uTime;
            varying vec2 vUv;
            
            void main() {
                // Fake noise/Cyberpunk vibe
                float noise = fract(sin(dot(vUv.xy ,vec2(12.9898,78.233))) * 43758.5453);
                vec3 baseColor = mix(uColor, vec3(0.0), uHover * 0.5);
                
                // Scanlines
                float scan = step(0.5, fract(vUv.y * 100.0 + uTime)) * 0.1;
                
                gl_FragColor = vec4(baseColor - scan + noise * 0.05, 1.0);
            }
        `;

        elements.forEach((el, index) => {
            const htmlEl = el as HTMLElement;
            const bounds = htmlEl.getBoundingClientRect();
            
            // Random dark cyberpunk color for placeholder
            const colors = [0x0f172a, 0x1e293b, 0x020617, 0x172554, 0x312e81];
            const color = new THREE.Color(colors[index % colors.length]);

            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uColor: { value: color },
                    uHover: { value: 0 },
                    uTime: { value: 0 },
                    uScrollVelocity: { value: 0 },
                    uActive: { value: 0 },
                },
                transparent: true,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(this.geometry, material);
            this.scene.add(mesh);

            this.items.push({
                element: htmlEl,
                mesh,
                bounds,
                initialY: bounds.top + window.scrollY
            });
        });
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.onResize.bind(this));
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            if (this.isInteracting && this.activeItem) return;

            // Simple raycasting hover
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.items.map(i => i.mesh));

            this.items.forEach(item => {
                const mat = item.mesh.material as THREE.ShaderMaterial;
                gsap.to(mat.uniforms.uHover, {
                    value: 0,
                    duration: 0.3
                });
            });

            if (intersects.length > 0) {
                const hoveredMesh = intersects[0].object as THREE.Mesh;
                const mat = hoveredMesh.material as THREE.ShaderMaterial;
                gsap.to(mat.uniforms.uHover, {
                    value: 1,
                    duration: 0.3
                });
            }
        });

        window.addEventListener('click', () => {
             this.raycaster.setFromCamera(this.mouse, this.camera);
             const intersects = this.raycaster.intersectObjects(this.items.map(i => i.mesh));

             if (this.isInteracting && this.activeItem) {
                 // Close the item
                 this.closeItem();
             } else if (intersects.length > 0) {
                 const clickedMesh = intersects[0].object as THREE.Mesh;
                 const clickedItem = this.items.find(i => i.mesh === clickedMesh);
                 if (clickedItem) this.openItem(clickedItem);
             }
        });
    }

    private openItem(item: SyncItem) {
        this.isInteracting = true;
        this.activeItem = item;
        this.lenis.stop(); // Stop scroll when focused

        const mat = item.mesh.material as THREE.ShaderMaterial;

        // Animate to full screen
        gsap.to(item.mesh.position, {
            x: 0,
            y: 0, // Center of camera
            z: this.camera.position.z - 200, // Move towards camera
            duration: 1.5,
            ease: "expo.inOut"
        });

        gsap.to(item.mesh.scale, {
            x: window.innerWidth, // Full width
            y: window.innerHeight, // Full height
            duration: 1.5,
            ease: "expo.inOut"
        });

        gsap.to(mat.uniforms.uActive, {
            value: 1,
            duration: 1.5,
            ease: "expo.inOut"
        });

        // Hide DOM temporarily
        gsap.to("#main-content", { opacity: 0, duration: 0.5 });
    }

    private closeItem() {
        if (!this.activeItem) return;
        const item = this.activeItem;

        const mat = item.mesh.material as THREE.ShaderMaterial;

        // Back to normal size and position based on DOM bounds
        const bounds = item.element.getBoundingClientRect();
        
        gsap.to(item.mesh.scale, {
            x: bounds.width,
            y: bounds.height,
            duration: 1.2,
            ease: "expo.inOut"
        });

        gsap.to(mat.uniforms.uActive, {
            value: 0,
            duration: 1.2,
            ease: "expo.inOut"
        });

        gsap.to("#main-content", { opacity: 1, duration: 0.5 });
        
        setTimeout(() => {
            this.isInteracting = false;
            this.activeItem = null;
            this.lenis.start();
        }, 1200);
    }

    private onResize() {
        this.syncCameraFov();
        // Update true bounds
        this.items.forEach(item => {
            item.bounds = item.element.getBoundingClientRect();
            item.initialY = item.bounds.top + window.scrollY;
        });
    }

    public update(time: number) {
        if (!this.isInteracting) {
            // Smoothly interpolate scroll velocity to uniform
            this.items.forEach(item => {
                const htmlEl = item.element;
                const bounds = htmlEl.getBoundingClientRect(); // Current bounds with scroll
                
                // Map CSS px to WebGL space. 
                // Center of screen is (0,0) in WebGL. Web page is origin top-left.
                const x = bounds.left + bounds.width / 2 - window.innerWidth / 2;
                const y = -bounds.top - bounds.height / 2 + window.innerHeight / 2;

                item.mesh.position.set(x, y, 0);
                item.mesh.scale.set(bounds.width, bounds.height, 1);
                
                const mat = item.mesh.material as THREE.ShaderMaterial;
                mat.uniforms.uTime.value = time;
                
                // Animate velocity uniform
                mat.uniforms.uScrollVelocity.value = THREE.MathUtils.lerp(
                    mat.uniforms.uScrollVelocity.value, 
                    this.scrollData.velocity, 
                    0.1
                );
            });
        } else if (this.activeItem) {
            // Only update time uniform when active
            const mat = this.activeItem.mesh.material as THREE.ShaderMaterial;
            mat.uniforms.uTime.value = time;
        }
    }
}
