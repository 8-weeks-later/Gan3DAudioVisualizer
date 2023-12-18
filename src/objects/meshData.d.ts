export default class MeshData{
    positions: Float32Array;
    colors: Float32Array;
    indices: Uint16Array;
    uv: Float32Array;
    normals: Float32Array;

    constructor(positions: Float32Array, 
        colors: Float32Array, 
        indices: Uint16Array,
        uv: Float32Array,
        normals: Float32Array);
}