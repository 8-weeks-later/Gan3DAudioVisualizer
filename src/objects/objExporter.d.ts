import MeshData from './meshData';
import Mesh from './mesh';

export default class ObjExporter{
    static exportMeshData(meshData: MeshData): string;
    static exportMesh(mesh: Mesh): string;
}