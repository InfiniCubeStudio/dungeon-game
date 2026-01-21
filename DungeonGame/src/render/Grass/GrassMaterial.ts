import { ShaderMaterial, DoubleSide, Vector3 } from "three";

export function createGrassMaterial(): ShaderMaterial {
    return new ShaderMaterial({
        side: DoubleSide,
        uniforms: {
            time: { value: 0 },
            windStrength: { value: 0.1 },

            playerPos: { value: new Vector3 },
            pushRadius: { value: 1.5 },
            pushStrength: { value: 0.6 }
        },

        vertexShader: `
      uniform float time;
      uniform float windStrength;

      varying vec2 vUv;

      void main() {
        vec3 pos = position;

        float sway = sin(time + (pos.y * 6.0) + (instanceMatrix[3][0] * 0.5) + (instanceMatrix[3][2] * -0.2)) * windStrength;
        pos.x += sway * pos.y;

        vUv = uv;

        vec4 instancePosition = instanceMatrix * vec4(pos, 1.0);

        gl_Position = projectionMatrix * modelViewMatrix * instancePosition;

      }

    `,
        fragmentShader: `
        varying vec2 vUv;
      void main() {
      float num = (vUv.y * 0.7) + 0.3;
        gl_FragColor = vec4(0.2, 0.8, 0.3, 1.0) * num;
      }
    `
    });
}