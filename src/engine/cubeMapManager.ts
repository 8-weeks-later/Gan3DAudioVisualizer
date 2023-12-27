import MeshData from '../objects/meshData';

export default class CubeMapManager{
    //#region Singleton
    private static instance: CubeMapManager;

    private constructor() {
    }

    public static getInstance() {
        return this.instance || (this.instance = new this())
    }
    //#endregion Singleton

    private cubeMapTexture: GPUTexture;

    public async loadCubeMap(device: GPUDevice): Promise<void>{
        // The order of the array layers is [+X, -X, +Y, -Y, +Z, -Z]
        const imgSources = [
            '../assets/img/cubemap/spaceblue/posx.png',
            '../assets/img/cubemap/spaceblue/negx.png',
            '../assets/img/cubemap/spaceblue/posy.png',
            '../assets/img/cubemap/spaceblue/negy.png',
            '../assets/img/cubemap/spaceblue/posz.png',
            '../assets/img/cubemap/spaceblue/negz.png',
        ];
        const promises = imgSources.map(async (src) => {
            const response = await fetch(src);
            return createImageBitmap(await response.blob());
        });
        const imageBitmaps = await Promise.all(promises);

        this.cubeMapTexture = device.createTexture({
            dimension: '2d',
            // Create a 2d array texture.
            // Assume each image has the same size.
            size: [imageBitmaps[0].width, imageBitmaps[0].height, 6],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        for (let i = 0; i < imageBitmaps.length; i++) {
            const imageBitmap = imageBitmaps[i];
            device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: this.cubeMapTexture, origin: [0, 0, i] },
                [imageBitmap.width, imageBitmap.height]
            );
        }
    }

    public getCubeMapTexture(): GPUTexture{
        return this.cubeMapTexture;
    }
}