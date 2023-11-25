export default class MeshData{
    positions: Float32Array;
    colors: Float32Array;
    indices: Uint16Array;
    uv: Float32Array;
    
    constructor(positions: Float32Array, 
        colors: Float32Array, 
        indices: Uint16Array,
        uv: Float32Array){
        this.positions = positions;
        this.colors = colors;
        this.indices = indices;
        this.uv = uv;
    }
}