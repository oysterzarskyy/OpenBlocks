#import bevy_pbr::forward_io::VertexOutput

@group(2) @binding(0) var<uniform> block_color: vec4<f32>;
@group(2) @binding(1) var<uniform> block_style: vec4<f32>;

fn hash_cell(cell: vec2<f32>) -> f32 {
    return fract(sin(dot(cell, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    let scaled_uv = mesh.uv * max(block_style.x, 1.0);
    let pattern_id = block_style.w;
    var pattern_uv = scaled_uv;

    if pattern_id > 0.5 && pattern_id < 1.5 {
        pattern_uv.x += floor(pattern_uv.y) * 0.5;
    }

    let local_uv = fract(pattern_uv);
    let edge_distance = min(
        min(local_uv.x, 1.0 - local_uv.x),
        min(local_uv.y, 1.0 - local_uv.y),
    );
    let grid_line = 1.0 - step(block_style.z, edge_distance);
    let cell_noise = hash_cell(floor(pattern_uv));
    var detail = 0.92 + cell_noise * 0.08;

    if pattern_id > 1.5 && pattern_id < 2.5 {
        let grain = sin(scaled_uv.y * 42.0 + sin(scaled_uv.x * 7.0) * 2.4);
        detail = 0.76 + 0.24 * (0.5 + 0.5 * grain);
    } else if pattern_id > 2.5 && pattern_id < 3.5 {
        let stone_noise = hash_cell(floor(scaled_uv * 15.0));
        detail = 0.72 + stone_noise * 0.28;
    } else if pattern_id > 3.5 && pattern_id < 4.5 {
        let leaf_noise = hash_cell(floor(scaled_uv * 10.0));
        let fleck = smoothstep(0.52, 0.88, leaf_noise);
        detail = 0.78 + fleck * 0.28;
    }

    let face_color = block_color.rgb * detail;
    let ink = vec3<f32>(0.055, 0.13, 0.18);
    let final_color = mix(face_color, ink, grid_line * block_style.y);
    return vec4<f32>(final_color, block_color.a);
}
