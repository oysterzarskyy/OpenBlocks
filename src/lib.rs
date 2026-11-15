use bevy::{
    prelude::*,
    reflect::TypePath,
    render::render_resource::{AsBindGroup, ShaderRef},
};

const BLOCK_SHADER_PATH: &str = "shaders/block_material.wgsl";
const TERRAIN_SHADER_PATH: &str = "grass/grass_texture.wgsl";

#[derive(Asset, TypePath, AsBindGroup, Debug, Clone)]
struct BlockMaterial {
    #[uniform(0)]
    color: LinearRgba,
    #[uniform(1)]
    style: Vec4,
}

impl Material for BlockMaterial {
    fn fragment_shader() -> ShaderRef {
        BLOCK_SHADER_PATH.into()
    }
}

#[derive(Asset, TypePath, AsBindGroup, Debug, Clone)]
struct TerrainMaterial {
    #[uniform(0)]
    color: LinearRgba,
}

impl Material for TerrainMaterial {
    fn fragment_shader() -> ShaderRef {
        TERRAIN_SHADER_PATH.into()
    }
}

#[derive(Resource, Default)]
struct AccessState {
    guest: bool,
}

#[derive(Resource, Default)]
struct LayoutOrientation(Option<bool>);

#[derive(Component)]
struct AccessScreen;

#[derive(Component)]
struct AccessCard;

#[derive(Component)]
struct BrandPanel;

#[derive(Component)]
struct AccessOptionsPanel;

#[derive(Component)]
struct GuestButton;

#[cfg_attr(target_os = "android", bevy_main)]
pub fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins,
            MaterialPlugin::<BlockMaterial>::default(),
            MaterialPlugin::<TerrainMaterial>::default(),
        ))
        .init_resource::<AccessState>()
        .init_resource::<LayoutOrientation>()
        .add_systems(Startup, (setup_scene, setup_access_screen))
        .add_systems(
            Update,
            (handle_guest_selection, adapt_access_layout, move_camera),
        )
        .run();
}

fn setup_scene(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut block_materials: ResMut<Assets<BlockMaterial>>,
    mut terrain_materials: ResMut<Assets<TerrainMaterial>>,
) {
    let block_mesh = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    let ground_mesh = meshes.add(Cuboid::new(14.0, 0.2, 14.0));
    let materials = [
        (Color::srgb(0.95, 0.39, 0.29), 1.0),
        (Color::srgb(0.37, 0.69, 0.92), 0.0),
        (Color::srgb(0.58, 0.32, 0.18), 2.0),
        (Color::srgb(0.48, 0.54, 0.58), 3.0),
        (Color::srgb(0.26, 0.61, 0.29), 4.0),
        (Color::srgb(0.98, 0.73, 0.28), 0.0),
    ]
    .map(|(color, pattern)| {
        block_materials.add(BlockMaterial {
            color: color.to_linear().into(),
            style: Vec4::new(3.0, 0.68, 0.035, pattern),
        })
    });
    let ground_material = terrain_materials.add(TerrainMaterial {
        color: Color::srgb(0.12, 0.34, 0.26).to_linear().into(),
    });

    commands.spawn((
        Mesh3d(ground_mesh),
        MeshMaterial3d(ground_material),
        Transform::from_xyz(0.0, -0.6, 0.0),
    ));

    for x in -2..=2 {
        for z in -2..=2 {
            let material_index = (x + z + 10).rem_euclid(materials.len() as i32) as usize;
            commands.spawn((
                Mesh3d(block_mesh.clone()),
                MeshMaterial3d(materials[material_index].clone()),
                Transform::from_xyz(x as f32, 0.0, z as f32),
            ));
        }
    }

    spawn_tree(
        &mut commands,
        &block_mesh,
        &materials[2],
        &materials[4],
        Vec3::new(-4.0, 0.0, 1.0),
    );
    spawn_tree(
        &mut commands,
        &block_mesh,
        &materials[2],
        &materials[4],
        Vec3::new(4.0, 0.0, 3.0),
    );
    spawn_stone_cluster(&mut commands, &block_mesh, &materials[3], Vec3::new(4.0, 0.0, -1.0));
    spawn_block_house(&mut commands, &block_mesh, &materials[0], &materials[2]);

    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(8.0, 8.0, 11.0).looking_at(Vec3::ZERO, Vec3::Y),
    ));
    commands.spawn((
        Camera2d,
        Camera {
            order: 1,
            clear_color: ClearColorConfig::None,
            ..default()
        },
        IsDefaultUiCamera,
    ));

    commands.spawn((
        DirectionalLight {
            illuminance: 12_000.0,
            shadows_enabled: true,
            ..default()
        },
        Transform::from_rotation(Quat::from_euler(
            EulerRot::XYZ,
            -std::f32::consts::FRAC_PI_4,
            std::f32::consts::FRAC_PI_8,
            0.0,
        )),
    ));
}

fn spawn_block(
    commands: &mut Commands,
    mesh: &Handle<Mesh>,
    material: &Handle<BlockMaterial>,
    position: Vec3,
) {
    commands.spawn((
        Mesh3d(mesh.clone()),
        MeshMaterial3d(material.clone()),
        Transform::from_translation(position),
    ));
}

fn spawn_tree(
    commands: &mut Commands,
    mesh: &Handle<Mesh>,
    wood: &Handle<BlockMaterial>,
    leaves: &Handle<BlockMaterial>,
    origin: Vec3,
) {
    for level in 0..3 {
        spawn_block(commands, mesh, wood, origin + Vec3::Y * (level as f32 + 0.5));
    }

    for (x, y, z) in [
        (0.0, 3.5, 0.0),
        (1.0, 2.5, 0.0),
        (-1.0, 2.5, 0.0),
        (0.0, 2.5, 1.0),
        (0.0, 2.5, -1.0),
        (0.0, 1.5, 0.0),
    ] {
        spawn_block(commands, mesh, leaves, origin + Vec3::new(x, y, z));
    }
}

fn spawn_stone_cluster(
    commands: &mut Commands,
    mesh: &Handle<Mesh>,
    stone: &Handle<BlockMaterial>,
    origin: Vec3,
) {
    for offset in [
        Vec3::new(0.0, 0.5, 0.0),
        Vec3::new(1.0, 0.5, 0.0),
        Vec3::new(0.5, 1.5, 0.0),
        Vec3::new(0.0, 0.5, 1.0),
    ] {
        spawn_block(commands, mesh, stone, origin + offset);
    }
}

fn spawn_block_house(
    commands: &mut Commands,
    mesh: &Handle<Mesh>,
    brick: &Handle<BlockMaterial>,
    wood: &Handle<BlockMaterial>,
) {
    let origin = Vec3::new(3.0, 0.0, -4.0);
    for x in 0..3 {
        for y in 0..2 {
            spawn_block(
                commands,
                mesh,
                brick,
                origin + Vec3::new(x as f32, y as f32 + 0.5, 0.0),
            );
            if x == 0 || x == 2 {
                spawn_block(
                    commands,
                    mesh,
                    brick,
                    origin + Vec3::new(x as f32, y as f32 + 0.5, 2.0),
                );
            }
        }
        for z in 0..3 {
            spawn_block(
                commands,
                mesh,
                wood,
                origin + Vec3::new(x as f32, 2.5, z as f32),
            );
        }
    }
}

fn setup_access_screen(mut commands: Commands) {
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                ..default()
            },
            BackgroundColor(Color::srgb(0.43, 0.8, 0.94)),
            AccessScreen,
        ))
        .with_children(|screen| {
            screen
                .spawn((
                    Node {
                        width: Val::Percent(100.0),
                        min_height: Val::Px(58.0),
                        padding: UiRect::horizontal(Val::Px(24.0)),
                        justify_content: JustifyContent::SpaceBetween,
                        align_items: AlignItems::Center,
                        ..default()
                    },
                    BackgroundColor(Color::srgb(0.07, 0.16, 0.27)),
                ))
                .with_children(|header| {
                    header.spawn(text_line("OPENBLOCKS", 20.0, Color::WHITE, Node::default()));
                    header.spawn(text_line(
                        "BETA  ·  GUEST ACCESS",
                        12.0,
                        Color::srgb(0.78, 0.94, 0.48),
                        Node::default(),
                    ));
                });

            screen
                .spawn((
                    Node {
                        width: Val::Percent(94.0),
                        max_width: Val::Px(1080.0),
                        margin: UiRect::top(Val::Px(22.0)),
                        padding: UiRect::all(Val::Px(12.0)),
                        flex_direction: FlexDirection::Row,
                        ..default()
                    },
                    BackgroundColor(Color::srgb(0.98, 0.98, 0.94)),
                    AccessCard,
                ))
                .with_children(|card| {
                    card.spawn((
                        Node {
                            width: Val::Percent(58.0),
                            min_height: Val::Px(350.0),
                            padding: UiRect::all(Val::Px(30.0)),
                            flex_direction: FlexDirection::Column,
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        BackgroundColor(Color::srgb(0.31, 0.76, 0.91)),
                        BrandPanel,
                    ))
                    .with_children(|brand| {
                        brand.spawn(text_line(
                            "BUILD A WORLD OF YOUR OWN",
                            17.0,
                            Color::srgb(0.07, 0.25, 0.4),
                            Node::default(),
                        ));
                        brand.spawn(text_line(
                            "Big ideas\nstart small.",
                            36.0,
                            Color::srgb(0.04, 0.2, 0.34),
                            Node {
                                margin: UiRect::top(Val::Px(14.0)),
                                ..default()
                            },
                        ));
                        brand.spawn(text_line(
                            "Explore a block-built playground and help shape what comes next.",
                            14.0,
                            Color::srgb(0.08, 0.25, 0.38),
                            Node {
                                width: Val::Percent(100.0),
                                margin: UiRect::top(Val::Px(12.0)),
                                ..default()
                            },
                        ));
                        brand
                            .spawn(Node {
                                margin: UiRect::top(Val::Px(24.0)),
                                align_items: AlignItems::FlexEnd,
                                ..default()
                            })
                            .with_children(|blocks| {
                                for (size, color) in [
                                    (28.0, Color::srgb(1.0, 0.58, 0.34)),
                                    (40.0, Color::srgb(0.76, 0.91, 0.39)),
                                    (32.0, Color::srgb(0.42, 0.71, 0.98)),
                                ] {
                                    blocks.spawn((
                                        Node {
                                            width: Val::Px(size),
                                            height: Val::Px(size),
                                            margin: UiRect::right(Val::Px(8.0)),
                                            ..default()
                                        },
                                        BackgroundColor(color),
                                    ));
                                }
                            });
                    });

                    card.spawn((
                        Node {
                            width: Val::Percent(42.0),
                            padding: UiRect::all(Val::Px(22.0)),
                            flex_direction: FlexDirection::Column,
                            ..default()
                        },
                        BackgroundColor(Color::WHITE),
                        AccessOptionsPanel,
                    ))
                    .with_children(|options| {
                        options
                            .spawn((
                                Node {
                                    align_self: AlignSelf::FlexStart,
                                    padding: UiRect::axes(Val::Px(10.0), Val::Px(5.0)),
                                    ..default()
                                },
                                BackgroundColor(Color::srgb(0.88, 0.96, 0.78)),
                            ))
                            .with_children(|badge| {
                                badge.spawn(text_line(
                                    "BETA  ·  GUEST ACCESS",
                                    11.0,
                                    Color::srgb(0.15, 0.38, 0.18),
                                    Node::default(),
                                ));
                            });

                        options.spawn(text_line(
                            "Join the beta",
                            24.0,
                            Color::srgb(0.11, 0.16, 0.2),
                            Node {
                                margin: UiRect::top(Val::Px(12.0)),
                                ..default()
                            },
                        ));
                        options.spawn(text_line(
                            "Email accounts unlock with the full release.",
                            13.0,
                            Color::srgb(0.35, 0.4, 0.44),
                            Node {
                                width: Val::Percent(100.0),
                                margin: UiRect::bottom(Val::Px(10.0)),
                                ..default()
                            },
                        ));

                        for label in ["EMAIL ADDRESS  ·  LOCKED", "PASSWORD  ·  LOCKED"] {
                            options
                                .spawn((
                                    Node {
                                        width: Val::Percent(100.0),
                                        min_height: Val::Px(38.0),
                                        margin: UiRect::bottom(Val::Px(8.0)),
                                        padding: UiRect::all(Val::Px(10.0)),
                                        align_items: AlignItems::Center,
                                        ..default()
                                    },
                                    BackgroundColor(Color::srgb(0.94, 0.95, 0.95)),
                                ))
                                .with_children(|field| {
                                    field.spawn(text_line(
                                        label,
                                        12.0,
                                        Color::srgb(0.48, 0.53, 0.57),
                                        Node::default(),
                                    ));
                                });
                        }

                        for label in [
                            "Log in with email  ·  LOCKED",
                            "Sign up with email  ·  LOCKED",
                        ] {
                            options
                                .spawn((
                                    Node {
                                        width: Val::Percent(100.0),
                                        min_height: Val::Px(38.0),
                                        margin: UiRect::bottom(Val::Px(7.0)),
                                        justify_content: JustifyContent::Center,
                                        align_items: AlignItems::Center,
                                        ..default()
                                    },
                                    BackgroundColor(Color::srgb(0.89, 0.91, 0.92)),
                                ))
                                .with_children(|locked| {
                                    locked.spawn(text_line(
                                        label,
                                        12.0,
                                        Color::srgb(0.45, 0.49, 0.52),
                                        Node::default(),
                                    ));
                                });
                        }

                        options
                            .spawn((
                                Button,
                                Node {
                                    width: Val::Percent(100.0),
                                    min_height: Val::Px(48.0),
                                    margin: UiRect::top(Val::Px(5.0)),
                                    justify_content: JustifyContent::Center,
                                    align_items: AlignItems::Center,
                                    ..default()
                                },
                                BackgroundColor(Color::srgb(0.3, 0.67, 0.24)),
                                GuestButton,
                            ))
                            .with_children(|button| {
                                button.spawn(text_line(
                                    "Continue as guest",
                                    17.0,
                                    Color::WHITE,
                                    Node::default(),
                                ));
                            });

                        options.spawn(text_line(
                            "No account needed for beta. Email is not collected.",
                            11.0,
                            Color::srgb(0.42, 0.47, 0.5),
                            Node {
                                width: Val::Percent(100.0),
                                margin: UiRect::top(Val::Px(10.0)),
                                ..default()
                            },
                        ));
                    });
                });
        });
}

fn text_line(
    text: &str,
    font_size: f32,
    color: Color,
    node: Node,
) -> (Text, TextFont, TextColor, Node, Label) {
    (
        Text::new(text),
        TextFont {
            font_size,
            ..default()
        },
        TextColor(color),
        node,
        Label,
    )
}

fn adapt_access_layout(
    windows: Query<&Window>,
    mut orientation: ResMut<LayoutOrientation>,
    mut cards: Query<&mut Node, With<AccessCard>>,
    mut brand_panels: Query<&mut Node, (With<BrandPanel>, Without<AccessOptionsPanel>)>,
    mut option_panels: Query<&mut Node, (With<AccessOptionsPanel>, Without<BrandPanel>)>,
) {
    let Some(window) = windows.iter().next() else {
        return;
    };
    let is_landscape = window.width() >= window.height();
    if orientation.0 == Some(is_landscape) {
        return;
    }
    orientation.0 = Some(is_landscape);

    for mut node in &mut cards {
        node.flex_direction = if is_landscape {
            FlexDirection::Row
        } else {
            FlexDirection::Column
        };
    }
    for mut node in &mut brand_panels {
        node.width = Val::Percent(if is_landscape { 58.0 } else { 100.0 });
        node.min_height = Val::Px(if is_landscape { 350.0 } else { 160.0 });
        node.padding = UiRect::all(Val::Px(if is_landscape { 26.0 } else { 16.0 }));
    }
    for mut node in &mut option_panels {
        node.width = Val::Percent(if is_landscape { 42.0 } else { 100.0 });
        node.padding = UiRect::all(Val::Px(if is_landscape { 22.0 } else { 16.0 }));
    }
}

fn handle_guest_selection(
    mut access: ResMut<AccessState>,
    mut buttons: Query<
        (&Interaction, &mut BackgroundColor),
        (Changed<Interaction>, With<GuestButton>),
    >,
    mut screen_visibility: Query<&mut Visibility, With<AccessScreen>>,
) {
    for (interaction, mut color) in &mut buttons {
        match *interaction {
            Interaction::Pressed => {
                *color = BackgroundColor(Color::srgb(0.24, 0.56, 0.2));
                access.guest = true;
                for mut visibility in &mut screen_visibility {
                    *visibility = Visibility::Hidden;
                }
            }
            Interaction::Hovered => {
                *color = BackgroundColor(Color::srgb(0.39, 0.75, 0.3));
            }
            Interaction::None => {
                *color = BackgroundColor(Color::srgb(0.3, 0.67, 0.24));
            }
        }
    }
}

fn move_camera(
    time: Res<Time>,
    keys: Res<ButtonInput<KeyCode>>,
    access: Res<AccessState>,
    mut cameras: Query<&mut Transform, With<Camera3d>>,
) {
    if !access.guest {
        return;
    }

    let mut direction = Vec3::ZERO;
    if keys.pressed(KeyCode::KeyW) || keys.pressed(KeyCode::ArrowUp) {
        direction.z -= 1.0;
    }
    if keys.pressed(KeyCode::KeyS) || keys.pressed(KeyCode::ArrowDown) {
        direction.z += 1.0;
    }
    if keys.pressed(KeyCode::KeyA) || keys.pressed(KeyCode::ArrowLeft) {
        direction.x -= 1.0;
    }
    if keys.pressed(KeyCode::KeyD) || keys.pressed(KeyCode::ArrowRight) {
        direction.x += 1.0;
    }

    if direction != Vec3::ZERO {
        for mut transform in &mut cameras {
            transform.translation += direction.normalize() * 5.0 * time.delta_secs();
        }
    }
}
