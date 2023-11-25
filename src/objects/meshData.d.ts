export default class MeshData{
    positions: Float32Array;
    colors: Float32Array;
    indices: Uint16Array;
    uv: Float32Array;
    // TODO: Normal
    // TODO: colors 제거하고 local position.y 기준으로 색상 적용

    constructor(positions: Float32Array, 
        colors: Float32Array, 
        indices: Uint16Array,
        uv: Float32Array);
}