export class PerlinNoise2D {
    p: Uint8Array;
    perm: Uint8Array;

    constructor(seed = 0) {
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);
        this.seed(seed);
    }

    seed(seed: number) {
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        for (let i = 0; i < 256; i++) {
            let j = (seed + 31 * i) & 255;
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
            this.perm[i] = this.perm[i + 256] = this.p[i];
        }
    }

    fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
    }

    grad(hash: number, x: number, y: number) {
        let h = hash & 15;
        let u = h < 8 ? x : y;
        let v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x: number, y: number) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        let u = this.fade(x);
        let v = this.fade(y);

        let a = this.perm[X] + Y;
        let aa = this.perm[a];
        let ab = this.perm[a + 1];
        let b = this.perm[X + 1] + Y;
        let ba = this.perm[b];
        let bb = this.perm[b + 1];

        return this.lerp(v, this.lerp(u, this.grad(this.perm[aa], x, y),
            this.grad(this.perm[ba], x - 1, y)),
            this.lerp(u, this.grad(this.perm[ab], x, y - 1),
                this.grad(this.perm[bb], x - 1, y - 1)));
    }
}