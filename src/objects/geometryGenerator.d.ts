import MeshData from "./meshData";
import ObjLoader from './objLoader';

export default class GeometryGenerator{
    objLoader: ObjLoader;

    makeTriangle(scale: number): MeshData;
    makeSquare(scale: number): MeshData;
    makeGrid(width: number, height: number, numSlices: number, numStacks: number): MeshData;
    makeBox(scale: number): MeshData;
    makeAudioMesh(data: number[], size: number, chunkSize: number): MeshData;
}