#import bevy_pbr::forward_io::VertexOutput

@group(2) @binding(0) var<uniform> terrain_color: vec4<f32>;

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    let wave = sin(mesh.uv.x * 18.0 + sin(mesh.uv.y * 7.0) * 0.7);
    let fleck = 0.94 + 0.06 * (0.5 + 0.5 * wave);
    let stripe = 1.0 - step(0.045, abs(fract(mesh.uv.y * 12.0) - 0.5));
    let color = terrain_color.rgb * fleck * (1.0 - stripe * 0.08);

    return vec4<f32>(color, terrain_color.a);
}
