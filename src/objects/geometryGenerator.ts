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

    makeGrid(width: number, height: number, numSlices: number, numStacks: number){
        const dx = width / numSlices;
        
        let position: number[] = [];
        let color: number[] = [];
        let uv: number[] = [];
        let indices: number[] = [];

        for(let i = 0; i <= numStacks; i++){
            const uvY = 1.0 - (i / (numStacks - 1));
            const scaler = 0.5 - uvY;
            const stackStartX = -width * 0.5;
            const stackStartY = height * scaler;
            const stackStartZ = 0.0;
            for(let j = 0; j <= numSlices; j++){
                let posX = j / numSlices;

                position.push(stackStartX + dx * j);
                position.push(stackStartY);
                position.push(stackStartZ);
                position.push(1.0);

                color.push(i / numStacks);
                color.push(1.0 - i / numStacks);
                color.push(0.0);
                color.push(1.0);

                uv.push(posX);
                uv.push(uvY);
            }
        }

        for(let s = 0; s < numStacks; s++){
            const padding = s * (numSlices + 1);
            for(let i = padding; i < padding + numSlices; i++){
                indices.push(i);
                indices.push(i + 2 + numSlices);
                indices.push(i + 1 + numSlices);
                indices.push(i);
                indices.push(i + 1);
                indices.push(i + 2 + numSlices);
            }
        }

        const positions = new Float32Array(position);
        const colors = new Float32Array(color);
        const uvArray = new Float32Array(uv);
        const indicesArray = new Uint16Array(indices);

        return new MeshData(positions, colors, indicesArray, uvArray);
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

    makeAudioMesh(data: number[], size: number, chunkSize: number): MeshData{
        const zSize = Math.ceil(data.length / chunkSize);
        let grid = this.makeGrid(size, size * 1.618, chunkSize, zSize);
        let positions = grid.positions;
        
        const height = Math.max(...data);
        const randomColor = Math.min(1.0, Math.random() * 0.5 + 0.5);

        for(let i = 0; i < data.length; i++)
        {
            positions[i * 4 + 2] = data[i] / height * size;

            const color = Math.min(1.0, data[i] / height + 0.3);
            grid.colors[i * 4] = color;
            grid.colors[i * 4 + 1] = (1 - color) * 0.5 + 0.5;
            grid.colors[i * 4 + 2] = randomColor;
            grid.colors[i * 4 + 3] = 1.0;
        }

        return grid;
    }
}