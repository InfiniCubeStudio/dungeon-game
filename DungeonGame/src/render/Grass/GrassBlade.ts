import { BufferGeometry, PlaneGeometry, Vector3 } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function createGrassBlade(): BufferGeometry {
    const height = 0.4;
    const width = 0.1;
    
    const geo = new PlaneGeometry(width, height, 1, 4);
    geo.translate(0, height / 2, 0);

    const position = geo.attributes.position;
    for (let i = 0; i < position.count; i++) {
        const y = position.getY(i);
        const x = position.getX(i);
        
        const taper = 1.0 - (y / height);
        position.setX(i, x * taper);
    }

    const blade1 = geo;
    const blade2 = geo.clone();
    blade2.rotateY(Math.PI / 2);

    const merged = BufferGeometryUtils.mergeGeometries([blade1, blade2]);

    const normals = merged.attributes.normal;
    for (let i = 0; i < normals.count; i++) {
        normals.setXYZ(i, 0, 1, 0);
    }

    blade1.dispose();
    blade2.dispose();

    return merged;
}