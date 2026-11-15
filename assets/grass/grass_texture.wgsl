#import bevy_pbr::forward_io::VertexOutput

@group(2) @binding(0) var<uniform> grass_color: vec4<f32>;

fn grass_hash(cell: vec2<f32>) -> f32 {
    return fract(sin(dot(cell, vec2<f32>(41.7, 289.3))) * 143758.5453);
}

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    let uv = mesh.uv * 34.0;
    let cell = floor(uv);
    let local = fract(uv);
    let seed = grass_hash(cell);
    let sway = sin(local.y * 3.14159 + seed * 6.28318) * 0.12;
    let blade_distance = abs(local.x - (0.5 + sway));
    let blade = (1.0 - smoothstep(0.035, 0.12, blade_distance)) * step(0.12, local.y);
    let fleck = grass_hash(floor(uv * 0.42));
    let blade_color = mix(
        vec3<f32>(0.12, 0.34, 0.18),
        vec3<f32>(0.39, 0.68, 0.27),
        0.45 + 0.4 * seed,
    );
    let base_color = grass_color.rgb * (0.91 + 0.16 * fleck);
    let color = mix(base_color, blade_color, blade * 0.8);

    return vec4<f32>(color, grass_color.a);
}
