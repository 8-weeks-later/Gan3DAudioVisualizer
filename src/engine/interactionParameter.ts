import Material from '../objects/material';
import Light from '../objects/light';
import { numOfLight } from '../setting';
import { vec3 } from 'gl-matrix';

export default class InteractionParameter{
    //#region Singleton
    private static instance: InteractionParameter;

    private constructor() {
        this.material.Initialize();
        for (let i = 0; i < numOfLight; i++) {
            let light = new Light();
            light.Initialize();
            this.lights.push(light);
        }

        vec3.set(this.lights[0].direction, 0.3, 0.3, -1.0);
        vec3.set(this.lights[1].direction, 0.3, -1, 0.2);
        vec3.set(this.lights[2].direction, 1.0, 0.3, -0.5);
    }

    public static getInstance() {
        return this.instance || (this.instance = new this())
    }
    //#endregion Singleton

    private material: Material = new Material();
    private lights: Light[] = [];

    public GetLight(index: number): Light{
        return this.lights[index];
    }

    public GetMaterial(): Material{
        return this.material;
    }
}