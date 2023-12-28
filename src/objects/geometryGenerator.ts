import { vec3 } from "gl-matrix";
import MeshData from "./meshData";
import ObjLoader from './objLoader';

const PI = 3.1415926535897932384626433832795;
const TWO_PI = 2.0 * PI;

const SQRT2 = 1.41421356237309504880;
const SQRT3 = 1.73205080756887729352;
const SQRT6 = 2.44948974278317809820;

export default class GeometryGenerator{
    private objLoader: ObjLoader = new ObjLoader();

    makeTriangle(scale: number): MeshData{
        let positions = new Float32Array([
            -scale, -scale, 0.0,
            scale, -scale, 0.0,
            0.0, scale, 0.0,
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
        let normals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ]);
        return new MeshData(positions, colors, indices, uv, normals);
    };

    makeSquare(scale: number): MeshData{
        let positions = new Float32Array([
            -scale, -scale, 0.0,
            scale, -scale, 0.0,
            scale, scale, 0.0,
            -scale, scale, 0.0,
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
        let normals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0 ,1,
        ]);

        return new MeshData(positions, colors, indices, uv, normals);
    }

    makeGrid(width: number, height: number, numSlices: number, numStacks: number){
        const dx = width / numSlices;
        
        let position: number[] = [];
        let color: number[] = [];
        let uv: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];

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

                color.push(i / numStacks);
                color.push(1.0 - i / numStacks);
                color.push(0.0);
                color.push(1.0);

                uv.push(posX);
                uv.push(uvY);

                normals.push(0.0);
                normals.push(0.0);
                normals.push(1.0);
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
        const normalsArray = new Float32Array(normals);

        return new MeshData(positions, colors, indicesArray, uvArray, normalsArray);
    }

    makeBox(scale: number): MeshData{
        let positions = new Float32Array([
            // top
            -scale, scale, -scale,
            -scale, scale, scale,
            scale, scale, scale,
            scale, scale, -scale,
            // bottom
            -scale, -scale, -scale,
            scale, -scale, -scale,
            scale, -scale, scale,
            -scale, -scale, scale,
            // front
            -scale, -scale, -scale,
            -scale, scale, -scale,
            scale, scale, -scale,
            scale, -scale, -scale,
            // back
            -scale, -scale, scale,
            scale, -scale, scale,
            scale, scale, scale,
            -scale, scale, scale,
            // left
            -scale, -scale, scale,
            -scale, scale, scale,
            -scale, scale, -scale,
            -scale, -scale, -scale,
            // right
            scale, -scale, scale,
            scale, -scale, -scale,
            scale, scale, -scale,
            scale, scale, scale,
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
        let normals = new Float32Array([
            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // front
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // back
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0 ,0,
        ]);

        return new MeshData(positions, colors, indices, uv, normals);
    }

    makeAudioMesh(data: number[], size: number, chunkSize: number): MeshData{
        const zSize = Math.ceil(data.length / chunkSize);
        let grid = this.makeGrid(size, size * 1.618, chunkSize, zSize);
        let positions = grid.positions;
        
        const height = Math.max(...data);
        const randomColor = Math.min(1.0, Math.random() * 0.5 + 0.5);

        for(let i = 0; i < data.length; i++)
        {
            positions[i * 3 + 2] = data[i] / height * size;

            const color = Math.min(1.0, data[i] / height + 0.3);
            grid.colors[i * 4] = color;
            grid.colors[i * 4 + 1] = (1 - color) * 0.5 + 0.5;
            grid.colors[i * 4 + 2] = randomColor;
            grid.colors[i * 4 + 3] = 1.0;

            if (i != 0 && i % chunkSize == 0) continue;
            if (i > data.length - 1) continue;
            const base = i * 3;
            const pos: vec3 = [positions[base], positions[base + 1], positions[base + 2]];
            const prevPos: vec3 = [positions[base - 3], positions[base - 2], positions[base - 1]];
            const nextChunkPos: vec3 = [positions[base + chunkSize], positions[base + 1 + chunkSize], positions[base + 2 + chunkSize]];

            const prevDir = vec3.create();
            vec3.subtract(prevDir, pos, prevPos);
            vec3.normalize(prevDir, prevDir);

            const nextDir = vec3.create();
            vec3.subtract(nextDir, nextChunkPos, pos);
            vec3.normalize(nextDir, nextDir);

            const normal = vec3.create();
            vec3.add(normal, prevDir, nextDir);
            vec3.normalize(normal, normal);

            grid.normals[base] = normal[0];
            grid.normals[base + 1] = normal[1];
            grid.normals[base + 2] = normal[2];
        }

        return grid;
    }

    makeObjMesh(obj: string): MeshData{
        let objData = this.objLoader.parse(obj);
        for (let i = 0; i < objData.colors.length; i += 4) {
            objData.colors[i] = 0.6;
            objData.colors[i + 1] = 0.6;
            objData.colors[i + 2] = 0.6;
            objData.colors[i + 3] = 1.0;
        }
        for (let i = 0; i < objData.normals.length; i += 3) {
            if (objData.normals[i] == 0 && objData.normals[i + 1] == 0 && objData.normals[i + 2] == 0) {
                const normal = vec3.normalize(vec3.create(), [objData.positions[i], objData.positions[i + 1], objData.positions[i + 2]]);
                objData.normals[i] = normal[0];
                objData.normals[i + 1] = normal[1];
                objData.normals[i + 2] = normal[2];
            }
        }
        return objData;
    }
}