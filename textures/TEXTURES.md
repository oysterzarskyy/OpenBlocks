# Textures and shaders

OpenBlocks currently uses procedural WGSL materials rather than external image textures.

## Active shader assets

- `assets/shaders/block_material.wgsl` draws grid seams and supports brick, wood grain, stone flecks, and foliage patterns. The material pattern ID is set by `BlockMaterial::style.w` in `src/lib.rs`.
- `assets/grass/grass_texture.wgsl` draws procedural grass blades on the ground through `TerrainMaterial`.
- `assets/shaders/terrain_material.wgsl` remains an alternate soft terrain treatment for future scene styles.

Rust material bindings must stay aligned with the WGSL `@group(2)` bindings and the `#[uniform(...)]` attributes. These custom shaders import Bevy's `bevy_pbr::forward_io::VertexOutput`.

The starter scene uses the patterns on a block palette, a small house, trees, and a stone cluster. Check shaders in the running app as well as with `cargo check`: WGSL is compiled by Bevy's render pipeline at runtime.

## Adding image textures later

When image assets are introduced:

- Store source files under a descriptive directory in `assets/`.
- Prefer lossless PNG for pixel art and UI; choose compressed GPU formats only after profiling.
- Keep color/albedo maps in sRGB and data maps such as normals or roughness linear.
- Record each asset's origin and license before checking it in.
- Keep dimensions modest and test on target devices.
