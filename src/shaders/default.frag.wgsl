@fragment
fn main(@location(0) inColor: vec3f,
        @location(1) inNornal: vec3f) -> @location(0) vec4f {
    return vec4f(inNornal, 1);
}