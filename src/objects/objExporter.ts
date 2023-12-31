import MeshData from './meshData';
import Mesh from './mesh';

export default class ObjExporter{
    static exportMeshData(meshData: MeshData): string{
        const fixedLen: number = 6;

        let result = "";
        for(let i = 0; i < meshData.positions.length; i += 3){
            result += `v ${meshData.positions[i].toFixed(fixedLen)} ${meshData.positions[i + 1].toFixed(fixedLen)} ${meshData.positions[i + 2].toFixed(fixedLen)}\n`;
        }
        for(let i = 0; i < meshData.uv.length; i += 2){
            result += `vt ${meshData.uv[i].toFixed(fixedLen)} ${meshData.uv[i + 1].toFixed(fixedLen)}\n`;
        }
        for(let i = 0; i < meshData.normals.length; i += 3){
            result += `vn ${meshData.normals[i].toFixed(fixedLen)} ${meshData.normals[i + 1].toFixed(fixedLen)} ${meshData.normals[i + 2].toFixed(fixedLen)}\n`;
        }
        for(let i = 0; i < meshData.indices.length; i += 3){
            result += `f ${meshData.indices[i]}//${meshData.indices[i]} ${meshData.indices[i + 1]}//${meshData.indices[i + 1]} ${meshData.indices[i + 2]}//${meshData.indices[i + 2]}\n`;
        }
        return result;
    }

    static exportMesh(mesh: Mesh): string{
        return ObjExporter.exportMeshData(mesh.meshData);
    }
}