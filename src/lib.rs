use bevy::prelude::*;

#[cfg_attr(target_os = "android", bevy_main)]
pub fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Startup, setup_scene)
        .add_systems(Update, move_camera)
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

fn move_camera(
    time: Res<Time>,
    keys: Res<ButtonInput<KeyCode>>,
    mut cameras: Query<&mut Transform, With<Camera3d>>,
) {
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
