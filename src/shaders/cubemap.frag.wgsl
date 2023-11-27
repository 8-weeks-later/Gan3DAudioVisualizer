@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_cube<f32>;

@fragment
fn main(@location(0) uv: vec2<f32>,
        @location(1) pos: vec4<f32>) -> @location(0) vec4<f32> {
    var cubemapVec = pos.xyz - vec3(0.5);
    return textureSample(myTexture, mySampler, cubemapVec); 
}