import { vec3 } from 'gl-matrix';

export default class Light{
    direction: vec3 = vec3.create();
    color: vec3 = vec3.create();
    intensity: number = 0;

    public Initialize(): void{
        vec3.set(this.direction, 0, 0, 1);
        vec3.set(this.color, 1, 1, 1);
        this.intensity = 1;
    }
}