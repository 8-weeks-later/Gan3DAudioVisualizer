export default class CubeMapManager{
    private static instance: CubeMapManager;
    private constructor();
    public static getInstance(): CubeMapManager;

    private cubeMapTexture: GPUTexture;
    private selectedImageIndex: number;
    private imageSources: string[][];

    public loadCubeMap(device: GPUDevice): Promise<void>;
    public getCubeMapTexture(): GPUTexture;
}