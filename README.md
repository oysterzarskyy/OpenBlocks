# OpenBlocks

OpenBlocks is a Rust block-building sandbox project.

OpenBlocks is an early-stage project exploring a community-built alternative to platforms like Roblox. The first milestone is a small 3D block-world prototype; a full platform for creating, sharing, and playing community-made experiences is a longer-term goal, not something this beta already provides.

> **Status:** early beta / prototype. Expect missing features, rough edges, and breaking changes.

## What’s here

- A Rust game foundation using [Bevy](https://bevy.org/).
- A basic 3D scene with a block grid and keyboard camera movement.
- A plain HTML/CSS/JavaScript landing page in `website/`.
- An Android arm64 debug APK workflow in GitHub Actions.

## Run the prototype

You’ll need a recent stable Rust toolchain. From the project root:

```sh
cargo run
```

Use **WASD** or the **arrow keys** to move the camera. The first prototype is intentionally small; block placement, saving, multiplayer, accounts, and publishing are not implemented yet.

## Preview the website

Open `website/index.html` in a browser. The landing page is static and has no build step or package installation.

## Android beta build

The **Android beta build** workflow compiles the Rust game for `arm64-v8a`, packages it as a debug APK, and uploads the APK as a workflow artifact. It runs on pushes to `main`/`master`, pull requests, or when started manually from the Actions tab.

To build locally, install the Android SDK/NDK and Gradle, then run:

```sh
cargo install cargo-ndk
cargo ndk -t arm64-v8a -o android/app/src/main/jniLibs build --release --lib
gradle -p android assembleDebug
```

The generated debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. This is a development build, not a Play Store release.

## Roadmap

1. **Playable sandbox:** camera controls, block placement/removal, and local world saving.
2. **Creator tools:** make building intuitive and support sharing world files.
3. **Community platform:** investigate multiplayer, publishing, discovery, and safety systems.
4. **More platforms:** improve desktop support and test Android builds with real devices.

The roadmap is exploratory and will change as the project develops.

## Contributing

Ideas, bug reports, and code contributions are welcome. Before opening a pull request, run `cargo fmt --check` and `cargo check` where possible. If you’re new to the project, a good first step is to open an issue describing what you’d like to work on.

## License

No license has been selected yet. Until one is added, all rights are reserved by the respective contributors; please ask before reusing or distributing project code.
