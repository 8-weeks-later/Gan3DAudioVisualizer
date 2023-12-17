import MeshData from "./meshData";

export default class GeometryGenerator{
    makeTriangle(scale: number): MeshData;
    makeSquare(scale: number): MeshData;
    makePlane(scale: number, xSize: number, ySize: number): MeshData;
    makeBox(scale: number): MeshData;
}