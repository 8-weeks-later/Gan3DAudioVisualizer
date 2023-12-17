import MeshData from "./meshData";

const PI = 3.1415926535897932384626433832795;
const TWO_PI = 2.0 * PI;

const SQRT2 = 1.41421356237309504880;
const SQRT3 = 1.73205080756887729352;
const SQRT6 = 2.44948974278317809820;

export default class GeometryGenerator{
    makeTriangle(scale: number): MeshData{
        let positions = new Float32Array([
            -scale, -scale, 0.0, 1,
            scale, -scale, 0.0, 1,
            0.0, scale, 0.0, 1,
        ]);
        let colors = new Float32Array([
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.5, 0.5, 1.0, 1.0,
        ]);
        let indices = new Uint16Array([
            0, 1, 2,
        ]);
        let uv = new Float32Array([
            0, 0,
            1, 0,
            0.5, 1,
        ]);
        return new MeshData(positions, colors, indices, uv);
    };

    makeSquare(scale: number): MeshData{
        let positions = new Float32Array([
            -scale, -scale, 0.0, 1,
            scale, -scale, 0.0, 1,
            scale, scale, 0.0, 1,
            -scale, scale, 0.0, 1,
        ]);
        let colors = new Float32Array([
            1.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
        ]);
        let indices = new Uint16Array([
            0, 1, 2,
            0, 2, 3,
        ]);
        let uv = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);

        return new MeshData(positions, colors, indices, uv);
    }

    makePlane(scale: number, xSize: number, ySize: number): MeshData{
        let positions = new Float32Array((xSize + 1) * (ySize + 1) * 4);
        let colors = new Float32Array((xSize + 1) * (ySize + 1) * 4);
        let indices = new Uint16Array(xSize * ySize * 6);
        let uv = new Float32Array((xSize + 1) * (ySize + 1) * 4);

        for(let y = 0; y <= ySize; y++){
            for(let x = 0; x <= xSize; x++){
                let i = y * (xSize + 1) + x;
                let u = x / xSize;
                let v = y / ySize;

                positions[i * 4 + 0] = scale * u;
                positions[i * 4 + 1] = scale * v;
                positions[i * 4 + 2] = 0.0;
                positions[i * 4 + 3] = 1.0;

                colors[i * 4 + 0] = x / xSize;
                colors[i * 4 + 1] = y / ySize;
                colors[i * 4 + 2] = 0.0;
                colors[i * 4 + 3] = 1.0;

                uv[i * 4 + 0] = u;
                uv[i * 4 + 1] = v;
                uv[i * 4 + 2] = 0.0;
                uv[i * 4 + 3] = 1.0;
            }
        }

        for(let y = 0; y < ySize; y++){
            for(let x = 0; x < xSize; x++){
                let i = (y * xSize + x) * 6;
                let vi = y * (xSize + 1) + x;

                indices[i + 0] = vi;
                indices[i + 1] = vi + 1;
                indices[i + 2] = vi + xSize + 1;
                indices[i + 3] = vi + xSize + 1;
                indices[i + 4] = vi + 1;
                indices[i + 5] = vi + xSize + 2;
            }
        }

        return new MeshData(positions, colors, indices, uv);
    }

    makeBox(scale: number): MeshData{
        let positions = new Float32Array([
            // top
            -scale, scale, -scale, 1,
            -scale, scale, scale, 1,
            scale, scale, scale, 1,
            scale, scale, -scale, 1,
            // bottom
            -scale, -scale, -scale, 1,
            scale, -scale, -scale, 1,
            scale, -scale, scale, 1,
            -scale, -scale, scale, 1,
            // front
            -scale, -scale, -scale, 1,
            -scale, scale, -scale, 1,
            scale, scale, -scale, 1,
            scale, -scale, -scale, 1,
            // back
            -scale, -scale, scale, 1,
            scale, -scale, scale, 1,
            scale, scale, scale, 1,
            -scale, scale, scale, 1,
            // left
            -scale, -scale, scale, 1,
            -scale, scale, scale, 1,
            -scale, scale, -scale, 1,
            -scale, -scale, -scale, 1,
            // right
            scale, -scale, scale, 1,
            scale, -scale, -scale, 1,
            scale, scale, -scale, 1,
            scale, scale, scale, 1,
        ]);
        let colors = new Float32Array([
            // top - red
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            // bottom - green
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            // front - blue
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            // back - yellow
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            // left - cyan
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            // right - magenta
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
        ]);
        let indices = new Uint16Array([
            // top
            0, 1, 2, 0, 2, 3,
            // bottom
            4, 5, 6, 4, 6, 7,
            // front
            8, 9, 10, 8, 10, 11,
            // back
            12, 13, 14, 12, 14, 15,
            // left
            16, 17, 18, 16, 18, 19,
            // right
            20, 21, 22, 20, 22, 23,
        ]);
        let uv = new Float32Array([
            // top
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            // bottom
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            // front
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            // back
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            // left
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            // right
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);

        return new MeshData(positions, colors, indices, uv);
    }
}