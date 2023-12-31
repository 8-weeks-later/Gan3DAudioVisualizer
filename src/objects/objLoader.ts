// based on: https://gist.github.com/ccincotti3/9778061917d49e967c822e0c5a28f6ef#file-obj_loader_web_gpu-ts
import MeshData from './meshData';

type ObjFile = string
type FilePath = string

type CachePosition = number
type CacheFace = string
type CacheNormal = number
type CacheUv = number
type CacheArray<T> = T[][]

type toBeFloat32 = number
type toBeUInt16 = number

/**
 * ObjLoader to load in .obj files. This has only been tested on Blender .obj exports that have been UV unwrapped
 * and you may need to throw out certain returned fields if the .OBJ is missing them (ie. uvs or normals)
 */
export default class ObjLoader {
    constructor() {}
    /**
     * Parse a given obj file into a Mesh
     */
    parse(file: ObjFile): MeshData {
        const lines = file?.split("\n")

        // Store what's in the object file here
        const cachedPositions: CacheArray<CachePosition> = []
        const cachedFaces: CacheArray<CacheFace> = []
        const cachedNormals: CacheArray<CacheNormal> = []
        const cachedUvs: CacheArray<CacheUv> = []

        // Read out data from file and store into appropriate source buckets
        {
            for (const untrimmedLine of lines) {
                const line = untrimmedLine.trim() // remove whitespace
                const [startingChar, ...data] = line.split(" ")
                switch (startingChar) {
                    case "v":
                        cachedPositions.push(data.map(parseFloat))
                        break
                    case "vt":
                        cachedUvs.push(data.map(Number))
                        break
                    case "vn":
                        cachedNormals.push(data.map(parseFloat))
                        break
                    case "f":
                        cachedFaces.push(data)
                        break
                }
            }
        }

        // Use these intermediate arrays to leverage Array API (.push)
        const finalPositions: toBeFloat32[] = []
        const finalNormals: toBeFloat32[] = []
        const finalUvs: toBeFloat32[] = []
        const finalIndices: toBeUInt16[] = []

        // Loop through faces, and return the buffers that will be sent to GPU for rendering
        {
            const cache: Record<string, number> = {}
            let i = 0
            for (const faces of cachedFaces) {
                for (const faceString of faces) {
                    // If we already saw this, add to indices list.
                    if (cache[faceString] !== undefined) {
                        finalIndices.push(cache[faceString])
                        continue
                    }

                    cache[faceString] = i
                    finalIndices.push(i)

                    // Need to convert strings to integers, and subtract by 1 to get to zero index.
                    const [vI, uvI, nI] = faceString
                        .split("/")
                        .map((s: string) => Number(s) - 1)

                    vI > -1 && finalPositions.push(...cachedPositions[vI])
                    uvI > -1 && finalUvs.push(...cachedUvs[uvI])
                    nI > -1 && finalNormals.push(...cachedNormals[nI])

                    i += 1
                }
            }
        }

        return {
            positions: new Float32Array(finalPositions),
            uv: new Float32Array(finalUvs),
            normals: new Float32Array(finalNormals),
            indices: new Uint16Array(finalIndices),
            colors: new Float32Array((finalPositions.length / 3) * 4).fill(0.75),
        }
    }
}