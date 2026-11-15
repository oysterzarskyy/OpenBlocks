use bevy::prelude::*;

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
        .add_plugins(DefaultPlugins)
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
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let block_mesh = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    let ground_mesh = meshes.add(Cuboid::new(14.0, 0.2, 14.0));
    let block_material = materials.add(Color::srgb(0.25, 0.72, 0.58));
    let ground_material = materials.add(Color::srgb(0.16, 0.2, 0.25));

    commands.spawn((
        Mesh3d(ground_mesh),
        MeshMaterial3d(ground_material),
        Transform::from_xyz(0.0, -0.6, 0.0),
    ));

    for x in -2..=2 {
        for z in -2..=2 {
            commands.spawn((
                Mesh3d(block_mesh.clone()),
                MeshMaterial3d(block_material.clone()),
                Transform::from_xyz(x as f32, 0.0, z as f32),
            ));
        }
    }

    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(8.0, 8.0, 11.0).looking_at(Vec3::ZERO, Vec3::Y),
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

fn setup_access_screen(mut commands: Commands) {
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    ..default()
                },
                background_color: BackgroundColor(Color::srgb(0.43, 0.8, 0.94)),
                ..default()
            },
            AccessScreen,
        ))
        .with_children(|screen| {
            screen
                .spawn(NodeBundle {
                    style: Style {
                        width: Val::Percent(100.0),
                        min_height: Val::Px(58.0),
                        padding: UiRect::horizontal(Val::Px(24.0)),
                        justify_content: JustifyContent::SpaceBetween,
                        align_items: AlignItems::Center,
                        ..default()
                    },
                    background_color: BackgroundColor(Color::srgb(0.07, 0.16, 0.27)),
                    ..default()
                })
                .with_children(|header| {
                    header.spawn(text_line(
                        "OPENBLOCKS",
                        20.0,
                        Color::WHITE,
                        Style::default(),
                    ));
                    header.spawn(text_line(
                        "BETA  ·  GUEST ACCESS",
                        12.0,
                        Color::srgb(0.78, 0.94, 0.48),
                        Style::default(),
                    ));
                });

            screen
                .spawn((
                    NodeBundle {
                        style: Style {
                            width: Val::Percent(94.0),
                            max_width: Val::Px(1080.0),
                            margin: UiRect::top(Val::Px(22.0)),
                            padding: UiRect::all(Val::Px(12.0)),
                            flex_direction: FlexDirection::Row,
                            ..default()
                        },
                        background_color: BackgroundColor(Color::srgb(0.98, 0.98, 0.94)),
                        ..default()
                    },
                    AccessCard,
                ))
                .with_children(|card| {
                    card.spawn((
                        NodeBundle {
                            style: Style {
                                width: Val::Percent(58.0),
                                min_height: Val::Px(350.0),
                                padding: UiRect::all(Val::Px(30.0)),
                                flex_direction: FlexDirection::Column,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::srgb(0.31, 0.76, 0.91)),
                            ..default()
                        },
                        BrandPanel,
                    ))
                    .with_children(|brand| {
                        brand.spawn(text_line(
                            "BUILD A WORLD OF YOUR OWN",
                            17.0,
                            Color::srgb(0.07, 0.25, 0.4),
                            Style::default(),
                        ));
                        brand.spawn(text_line(
                            "Big ideas\nstart small.",
                            36.0,
                            Color::srgb(0.04, 0.2, 0.34),
                            Style {
                                margin: UiRect::top(Val::Px(14.0)),
                                ..default()
                            },
                        ));
                        brand.spawn(text_line(
                            "Explore a block-built playground and help shape what comes next.",
                            14.0,
                            Color::srgb(0.08, 0.25, 0.38),
                            Style {
                                width: Val::Percent(100.0),
                                margin: UiRect::top(Val::Px(12.0)),
                                ..default()
                            },
                        ));
                        brand
                            .spawn(NodeBundle {
                                style: Style {
                                    margin: UiRect::top(Val::Px(24.0)),
                                    align_items: AlignItems::FlexEnd,
                                    ..default()
                                },
                                ..default()
                            })
                            .with_children(|blocks| {
                                for (size, color) in [
                                    (28.0, Color::srgb(1.0, 0.58, 0.34)),
                                    (40.0, Color::srgb(0.76, 0.91, 0.39)),
                                    (32.0, Color::srgb(0.42, 0.71, 0.98)),
                                ] {
                                    blocks.spawn(NodeBundle {
                                        style: Style {
                                            width: Val::Px(size),
                                            height: Val::Px(size),
                                            margin: UiRect::right(Val::Px(8.0)),
                                            ..default()
                                        },
                                        background_color: BackgroundColor(color),
                                        ..default()
                                    });
                                }
                            });
                    });

                    card.spawn((
                        NodeBundle {
                            style: Style {
                                width: Val::Percent(42.0),
                                padding: UiRect::all(Val::Px(22.0)),
                                flex_direction: FlexDirection::Column,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::WHITE),
                            ..default()
                        },
                        AccessOptionsPanel,
                    ))
                    .with_children(|options| {
                        options
                            .spawn(NodeBundle {
                                style: Style {
                                    align_self: AlignSelf::FlexStart,
                                    padding: UiRect::axes(Val::Px(10.0), Val::Px(5.0)),
                                    ..default()
                                },
                                background_color: BackgroundColor(Color::srgb(0.88, 0.96, 0.78)),
                                ..default()
                            })
                            .with_children(|badge| {
                                badge.spawn(text_line(
                                    "BETA  ·  GUEST ACCESS",
                                    11.0,
                                    Color::srgb(0.15, 0.38, 0.18),
                                    Style::default(),
                                ));
                            });

                        options.spawn(text_line(
                            "Join the beta",
                            24.0,
                            Color::srgb(0.11, 0.16, 0.2),
                            Style {
                                margin: UiRect::top(Val::Px(12.0)),
                                ..default()
                            },
                        ));
                        options.spawn(text_line(
                            "Email accounts unlock with the full release.",
                            13.0,
                            Color::srgb(0.35, 0.4, 0.44),
                            Style {
                                width: Val::Percent(100.0),
                                margin: UiRect::bottom(Val::Px(10.0)),
                                ..default()
                            },
                        ));

                        for label in ["EMAIL ADDRESS  ·  LOCKED", "PASSWORD  ·  LOCKED"] {
                            options
                                .spawn(NodeBundle {
                                    style: Style {
                                        width: Val::Percent(100.0),
                                        min_height: Val::Px(38.0),
                                        margin: UiRect::bottom(Val::Px(8.0)),
                                        padding: UiRect::all(Val::Px(10.0)),
                                        align_items: AlignItems::Center,
                                        ..default()
                                    },
                                    background_color: BackgroundColor(Color::srgb(
                                        0.94, 0.95, 0.95,
                                    )),
                                    ..default()
                                })
                                .with_children(|field| {
                                    field.spawn(text_line(
                                        label,
                                        12.0,
                                        Color::srgb(0.48, 0.53, 0.57),
                                        Style::default(),
                                    ));
                                });
                        }

                        for label in [
                            "Log in with email  ·  LOCKED",
                            "Sign up with email  ·  LOCKED",
                        ] {
                            options
                                .spawn(NodeBundle {
                                    style: Style {
                                        width: Val::Percent(100.0),
                                        min_height: Val::Px(38.0),
                                        margin: UiRect::bottom(Val::Px(7.0)),
                                        justify_content: JustifyContent::Center,
                                        align_items: AlignItems::Center,
                                        ..default()
                                    },
                                    background_color: BackgroundColor(Color::srgb(
                                        0.89, 0.91, 0.92,
                                    )),
                                    ..default()
                                })
                                .with_children(|locked| {
                                    locked.spawn(text_line(
                                        label,
                                        12.0,
                                        Color::srgb(0.45, 0.49, 0.52),
                                        Style::default(),
                                    ));
                                });
                        }

                        options
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        width: Val::Percent(100.0),
                                        min_height: Val::Px(48.0),
                                        margin: UiRect::top(Val::Px(5.0)),
                                        justify_content: JustifyContent::Center,
                                        align_items: AlignItems::Center,
                                        ..default()
                                    },
                                    background_color: BackgroundColor(Color::srgb(0.3, 0.67, 0.24)),
                                    ..default()
                                },
                                GuestButton,
                            ))
                            .with_children(|button| {
                                button.spawn(text_line(
                                    "Continue as guest",
                                    17.0,
                                    Color::WHITE,
                                    Style::default(),
                                ));
                            });

                        options.spawn(text_line(
                            "No account needed for beta. Email is not collected.",
                            11.0,
                            Color::srgb(0.42, 0.47, 0.5),
                            Style {
                                width: Val::Percent(100.0),
                                margin: UiRect::top(Val::Px(10.0)),
                                ..default()
                            },
                        ));
                    });
                });
        });
}

fn text_line(text: &str, font_size: f32, color: Color, style: Style) -> TextBundle {
    TextBundle {
        text: Text::from_section(
            text,
            TextStyle {
                font_size,
                color,
                ..default()
            },
        ),
        style,
        ..default()
    }
}

fn adapt_access_layout(
    windows: Query<&Window>,
    mut orientation: ResMut<LayoutOrientation>,
    mut cards: Query<&mut Style, With<AccessCard>>,
    mut brand_panels: Query<&mut Style, (With<BrandPanel>, Without<AccessOptionsPanel>)>,
    mut option_panels: Query<&mut Style, (With<AccessOptionsPanel>, Without<BrandPanel>)>,
) {
    let Some(window) = windows.iter().next() else {
        return;
    };
    let is_landscape = window.width() >= window.height();
    if orientation.0 == Some(is_landscape) {
        return;
    }
    orientation.0 = Some(is_landscape);

    for mut style in &mut cards {
        style.flex_direction = if is_landscape {
            FlexDirection::Row
        } else {
            FlexDirection::Column
        };
    }
    for mut style in &mut brand_panels {
        style.width = Val::Percent(if is_landscape { 58.0 } else { 100.0 });
        style.min_height = Val::Px(if is_landscape { 350.0 } else { 160.0 });
        style.padding = UiRect::all(Val::Px(if is_landscape { 26.0 } else { 16.0 }));
    }
    for mut style in &mut option_panels {
        style.width = Val::Percent(if is_landscape { 42.0 } else { 100.0 });
        style.padding = UiRect::all(Val::Px(if is_landscape { 22.0 } else { 16.0 }));
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
