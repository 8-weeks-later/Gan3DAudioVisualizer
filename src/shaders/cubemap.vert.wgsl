// Declaration of bind groups used by the vertex shader
struct Camera {
  projection : mat4x4<f32>,
  view : mat4x4<f32>
};
@group(0) @binding(0) var<uniform> camera : Camera;

struct VSOut {
  @builtin(position) Position: vec4f,
  @location(0) pos: vec4<f32>,
};

@vertex
fn main(@location(0) inPos: vec3f,
        @location(1) inColor: vec3f) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = camera.projection * camera.view * vec4f(inPos, 1);
    vsOut.pos = 0.5 * (vec4(inPos, 1.0) + vec4(1.0, 1.0, 1.0, 1.0));
    return vsOut;
}