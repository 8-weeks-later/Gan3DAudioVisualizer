struct Camera {
  projection : mat4x4<f32>,
  view : mat4x4<f32>,
  position: vec3f, // ?? 어따씀
};
@group(0) @binding(0) var<uniform> camera : Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_cube<f32>;

@fragment
fn main(@location(0) inColor: vec3f,
        @location(2) uv: vec2f) -> @location(0) vec4f {
    return vec4f(inColor, 1);
}