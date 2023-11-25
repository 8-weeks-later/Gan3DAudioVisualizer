import MeshData from "./meshData";

export default class GeometryGenerator{
    makeTriangle(scale: number): MeshData;
    makeSquare(scale: number): MeshData;
    makeBox(scale: number): MeshData;
}