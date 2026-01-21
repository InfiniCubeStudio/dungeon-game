import {
    InstancedMesh,
    Object3D,
    Box3,
    Mesh,
    Vector3,
    ShaderMaterial
} from "three";

import { createGrassBlade } from "./GrassBlade";
import { createGrassMaterial } from "./GrassMaterial";
import { RenderEngine } from "../RenderEngine";

export class Grass {
    readonly mesh: InstancedMesh;
    readonly parent: Mesh;
    readonly material: ShaderMaterial;

    private readonly dummy = new Object3D();

    constructor(parent: Mesh, count = 500) {

        this.parent = parent;

        const geometry = createGrassBlade();
        this.material = createGrassMaterial();

        this.material.uniforms.windStrength.value = 0.6;

        this.mesh = new InstancedMesh(geometry, this.material, count);

        this.spawnOnTop();
        this.parent.add(this.mesh);
    }

    public updatePlayerPosition(position: Vector3): void {
        this.material.uniforms.playerPos.value.copy(position);
    }

    private spawnOnTop(): void {
        this.parent.geometry.computeBoundingBox();
        const box = this.parent.geometry.boundingBox!;
        const size = new Vector3();
        box.getSize(size);

        for (let i = 0; i < this.mesh.count; i++) {
            this.dummy.position.set(
                (Math.random() - 0.5) * size.x,
                0,
                (Math.random() - 0.5) * size.z
            );
            this.dummy.position.y = RenderEngine.noise.noise((this.dummy.position.x + 50) * 0.1, (this.dummy.position.z + 50) * 0.1) * 2,
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    public update(time: number): void {
        this.material.uniforms.time.value = time;
    }

    dispose(): void {
        this.mesh.geometry.dispose();
        this.material.dispose();
        this.parent.remove(this.mesh);
    }
}
