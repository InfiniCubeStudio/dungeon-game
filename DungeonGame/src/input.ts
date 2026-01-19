import * as THREE from 'three';

export class Input {

    private keyNames = ['w', 'a', 's', 'd', 'c', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright',' ', 'enter', 'shift'];

    keyStates: { [key: string]: number } = {};
    private keyStatesBool: { [key: string]: boolean } = {};

    mouseStates: { [button: string]: number } = {};
    private mouseStatesBool: { [button: string]: boolean } = {};

    mouseMovement: THREE.Vector2 = new THREE.Vector2();
    prevMouse: THREE.Vector2 = new THREE.Vector2();

    constructor(){
        window.addEventListener('pointermove', this.MouseMove);
        window.addEventListener('keydown', this.KeyDown);
        window.addEventListener('keyup', this.KeyUp);
        window.addEventListener('mousedown', this.MouseDown);
        window.addEventListener('mouseup', this.MouseUp);

        this.keyNames.forEach(key => {
            this.keyStates[key] = 0;
            this.keyStatesBool[key] = false;
        });

        for(let b = 0; b < 3; b++){
            this.mouseStates[b] = 0;
            this.mouseStatesBool[b] = false;
        }
    }

    Update(){
        this.keyNames.forEach(key => {
            if(this.keyStatesBool[key]){
                this.keyStates[key]++;
            } else {
                if(this.keyStates[key] > 0){
                    this.keyStates[key] = -1;
                    return;
                }
                this.keyStates[key] = 0;
            }
        });
        
        for(let b = 0; b < 3; b++){
            if(this.mouseStatesBool[b]){
                this.mouseStates[b]++;
            } else {
                if(this.mouseStates[b] > 0){
                    this.mouseStates[b] = -1;
                    return;
                }
                this.mouseStates[b] = 0;
            }
        }
    }

    Dispose(){
        window.removeEventListener('pointermove', this.MouseMove);
        window.removeEventListener('keydown', this.KeyDown);
        window.removeEventListener('keyup', this.KeyUp);
        window.removeEventListener('mousedown', this.MouseDown);
        window.removeEventListener('mouseup', this.MouseUp);
    }

    private MouseMove = (e: MouseEvent) => {
        this.mouseMovement.set(e.movementX, e.movementY);
    }

    private KeyDown = (e: KeyboardEvent) => {
        this.keyStatesBool[e.key.toLowerCase()] = true;
    }

    private KeyUp = (e: KeyboardEvent) => {
        this.keyStatesBool[e.key.toLowerCase()] = false;
    }

    private MouseDown = (e: MouseEvent) => {
        this.mouseStatesBool[e.button] = true;
    }

    private MouseUp = (e: MouseEvent) => {
        this.mouseStatesBool[e.button] = false;
    }
    
}