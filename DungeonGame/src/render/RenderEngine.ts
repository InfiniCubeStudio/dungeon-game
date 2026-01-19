import * as THREE from 'three';
import { deltaTime, vec2 } from 'three/tsl';
import { Input } from '../input';
import { Grass } from './Grass/Grass';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class RenderEngine {

    input: Input;

    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    camRotation: THREE.Vector2;

    hand: THREE.Object3D | null = null;
    handMixer: THREE.AnimationMixer | null = null;

    private lastTime: number; // used for Deltatime calculation

    private rafID: number | null = null; // used to fix StrictMode double initialization issue

    private testBox: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), new THREE.MeshBasicMaterial({ color: "#000" }))


    constructor(canvas: HTMLCanvasElement) {

        this.input = new Input();
        this.canvas = canvas;

        this.lastTime = performance.now();

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(new THREE.Color().setHex(0x0F110E), 0.06);
        this.scene.background = new THREE.Color().setHex(0x0F110E);

        this.camera = new THREE.PerspectiveCamera(90, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
        this.camRotation = new THREE.Vector2(0, 0);
        this.camera.rotation.order = "YXZ";
        this.camera.position.y = 1.3;
        this.camera.position.z = 1.5;

        this.testBox.position.set(0, 0, 0);
        this.scene.add(this.testBox);
        this.testBox.userData.grass = new Grass(this.testBox, 10000);

        this.InitializeSky();

        this.rafID = requestAnimationFrame(this.RenderFrame);

        window.addEventListener('contextmenu', this.PreventContextMenu);

        window.addEventListener('resize', this.Resize);
        this.canvas.addEventListener('click', this.ClickCanvas);
        this.Resize();


        const loader = new GLTFLoader();
        loader.load('https://cdn.jsdelivr.net/gh/InfiniCubeStudio/dungeon-game@main/DungeonGame/public/running.glb', (gltf) => {
            this.hand = gltf.scene;

            this.hand.rotateY(Math.PI);
            this.hand.rotateX(-0.1);
            this.hand.position.set(-.05, 0.02, 0.05); 
            this.hand.scale.set(0.3, 0.3, 0.3);

            this.camera.add(this.hand);
            this.scene.add(this.camera); // Ensure camera is in the scene

            // 3. Setup Animation
            this.handMixer = new THREE.AnimationMixer(this.hand);
            const action = this.handMixer.clipAction(gltf.animations[0]);
            action.play();
        });
    }

    private InitializeSky() {
        const sky = new Sky();
        sky.scale.setScalar(450000); // Make it huge
        this.scene.add(sky);

        const sun = new THREE.Vector3();
        const effectController = {
            elevation: 2, // 0 = Sunset, 90 = Noon
            azimuth: 180, // Rotation around the horizon
        };

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);
        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
    }

    private PreventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    }

    private ClickCanvas = () => {
        this.canvas.requestPointerLock({ unadjustedMovement: true });
    }

    private Resize = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);

        this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    Dispose() {
        this.input.Dispose();
        window.removeEventListener('resize', this.Resize);
        window.removeEventListener('contextmenu', this.PreventContextMenu);
        this.canvas.removeEventListener('click', this.ClickCanvas)
        cancelAnimationFrame(this.rafID as number);
        this.renderer.dispose();
    }

    // This is essentially the draw function
    private RenderFrame = () => {
        this.rafID = requestAnimationFrame(this.RenderFrame);
        
        const now = performance.now();
        const deltaTime = Math.min((now - this.lastTime) / 1000, 1);
        this.lastTime = now;

        this.input.Update();
        this.testBox.userData.grass.update(performance.now() * -0.002);
        this.MoveCamera();
        this.renderer.render(this.scene, this.camera);
        this.input.mouseMovement.set(0, 0);
        if (this.hand) {
            this.handMixer!.update(deltaTime);
        }
    }

    private MoveCamera() {
        

        //let diff: THREE.Vector2 = new THREE.Vector2((this.input.mouse.y - this.input.prevMouse.y) * -0.001, (this.input.mouse.x - this.input.prevMouse.x) * -0.001);

        this.camRotation.add(new THREE.Vector2(this.input.mouseMovement.y * -0.003, this.input.mouseMovement.x * -0.003));

        // Rotation
        this.camera.rotation.set(this.camRotation.x, this.camRotation.y, 0);

        // Position
        const inputDir = new THREE.Vector3(0, 0, 0);

        if (this.input.keyStates['w'] > 0) inputDir.z -= 1;
        if (this.input.keyStates['s'] > 0) inputDir.z += 1;
        if (this.input.keyStates['a'] > 0) inputDir.x -= 1;
        if (this.input.keyStates['d'] > 0) inputDir.x += 1;
        if (this.input.keyStates[' '] > 0) inputDir.y += 1;
        if (this.input.keyStates['shift'] > 0) inputDir.y -= 1;

        const yaw = new THREE.Quaternion();
        yaw.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
        inputDir.applyQuaternion(yaw).normalize();

        this.camera.position.add(inputDir.multiplyScalar(0.03));

    }

    private lerp(start: number, end: number, amount: number): number {
        return (start * (1 - amount) + end * amount);
    }

}