struct Camera {
  projection : mat4x4<f32>,
  view : mat4x4<f32>
};

@group(0) @binding(0) var<uniform> camera : Camera;
@group(0) @binding(1) var<uniform> model : mat4x4<f32>;

struct VSOut {
    @builtin(position) Position: vec4f,
    @location(0) color: vec4f,
    @location(1) normal: vec3f,
    @location(2) pos: vec3f
 };

@vertex
fn main(@location(0) inPos: vec3f,
        @location(1) inColor: vec4f,
        @location(2) uv: vec2f,
        @location(3) normal: vec3f) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = camera.projection * camera.view * model * vec4f(inPos, 1);
    vsOut.color = inColor;
    vsOut.normal = (model * vec4f(normal, 0)).xyz;
    vsOut.pos = inPos;
    return vsOut;
}