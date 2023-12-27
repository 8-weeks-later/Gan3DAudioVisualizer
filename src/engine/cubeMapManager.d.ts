export default class CubeMapManager{
    private static instance: CubeMapManager;
    private constructor();
    public static getInstance(): CubeMapManager;

    private cubeMapTexture: GPUTexture;

    public loadCubeMap(device: GPUDevice): Promise<void>;
    public getCubeMapTexture(): GPUTexture;
}