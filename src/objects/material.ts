import { vec3 } from 'gl-matrix';

export default class Material{
    ambient: vec3 = vec3.create();
    diffuse: vec3 = vec3.create();
    specular: vec3 = vec3.create();
    shininess: number = 0;

    public Initialize(): void{
        vec3.set(this.ambient, 0.1, 0.1, 0.1);
        vec3.set(this.diffuse, 0.5, 0.5, 0.5);
        vec3.set(this.specular, 1, 1, 1);
        this.shininess = 32;
    }
}