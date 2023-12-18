struct Light{
    direction: vec3f,
    color: vec3f,
    intensity: f32,
};

struct Material{
    ambient: vec3f,
    diffuse: vec3f,
    specular: vec3f,
    shininess: f32,
};

fn BlinnPhong(inLight: Light, inMaterial: Material, inNormal: vec3f, inViewDir: vec3f) -> vec3f {
    var ambient = inLight.color * inMaterial.ambient;
    var lightDir = normalize(-inLight.direction);
    var viewDir = normalize(inViewDir);
    var halfDir = normalize(lightDir + viewDir);
    var diff = max(dot(inNormal, lightDir), 0.0);
    var diffuse = inLight.color * inMaterial.diffuse * diff;
    var spec = pow(max(dot(inNormal, halfDir), 0.0), inMaterial.shininess);
    var specular = inLight.color * inMaterial.specular * spec;
    return ambient + diffuse + specular;
}

fn computeLighting(inLight: Light, inMaterial: Material, inNormal: vec3f, inViewDir: vec3f) -> vec3f {
    return BlinnPhong(inLight, inMaterial, inNormal, inViewDir) * inLight.intensity;
}

@fragment
fn main(@location(0) inColor: vec3f,
        @location(1) inNornal: vec3f) -> @location(0) vec4f {
    var light = Light(vec3f(0.3, 0.3, 0.3), vec3f(1, 1, 1), 2);
    var material = Material(vec3f(0.1, 0.1, 0.1), vec3f(0.5, 0.5, 0.5), vec3f(1, 1, 1), 32);
    var viewDir = vec3f(0, 0, 1);
    
    var outColor = computeLighting(light, material, inNornal, viewDir);
    return vec4f(inColor * outColor, 1);
}