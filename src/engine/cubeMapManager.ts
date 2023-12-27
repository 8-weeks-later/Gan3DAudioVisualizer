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
    private selectedImageIndex: number = 0;

    // The order of the array layers is [+X, -X, +Y, -Y, +Z, -Z]
    private imageSources: string[][] = [
        [
            '../assets/img/cubemap/base/posx.jpg',
            '../assets/img/cubemap/base/negx.jpg',
            '../assets/img/cubemap/base/posy.jpg',
            '../assets/img/cubemap/base/negy.jpg',
            '../assets/img/cubemap/base/posz.jpg',
            '../assets/img/cubemap/base/negz.jpg',
        ],
        [
            '../assets/img/cubemap/spaceblue/posx.png',
            '../assets/img/cubemap/spaceblue/negx.png',
            '../assets/img/cubemap/spaceblue/posy.png',
            '../assets/img/cubemap/spaceblue/negy.png',
            '../assets/img/cubemap/spaceblue/posz.png',
            '../assets/img/cubemap/spaceblue/negz.png',
        ]
    ]

    public changeCubeMap(index: number, device: GPUDevice): void{
        index = index < 0 ? this.imageSources.length + index : index;
        index = index % this.imageSources.length;
        this.selectedImageIndex = index;
        this.loadCubeMap(device).then(() => {
            console.log("CubeMap Changed");
        });
    }

    public async loadCubeMap(device: GPUDevice): Promise<void>{
        const promises = this.imageSources[this.selectedImageIndex].map(async (src) => {
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