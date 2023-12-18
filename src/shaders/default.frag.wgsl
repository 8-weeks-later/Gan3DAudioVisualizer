// 16 bytes의 배수로 맞추기 위한 dummy 변수 선언
struct Light{
    direction: vec3f,
    dummy1: f32,
    color: vec3f,
    intensity: f32,
};

struct Material{
    ambient: vec3f,
    dummy1: f32,
    diffuse: vec3f,
    dummy2: f32,
    specular: vec3f,
    shininess: f32,
};

@group(0) @binding(2) var<uniform> eyePos: vec4f;
@group(0) @binding(3) var<uniform> light: array<Light, 3>;
@group(0) @binding(4) var<uniform> material: Material;

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
        @location(1) inNornal: vec3f,
        @location(2) inPos: vec3f) -> @location(0) vec4f {
    var viewDir = normalize(vec3(eyePos.xyz) - inPos);

    var outColor = computeLighting(light[0], material, inNornal, viewDir);
    outColor += computeLighting(light[1], material, inNornal, viewDir);
    outColor += computeLighting(light[2], material, inNornal, viewDir);
    
    return vec4f(inColor * outColor, 1);
}