# OpenBlocks

OpenBlocks is a Rust block-building sandbox project.

OpenBlocks is an early-stage project exploring a community-built alternative to platforms like Roblox. The first milestone is a small 3D block-world prototype; a full platform for creating, sharing, and playing community-made experiences is a longer-term goal, not something this beta already provides.

> **Status:** early beta / prototype. Expect missing features, rough edges, and breaking changes.

## What’s here

- A Rust game foundation using [Bevy](https://bevy.org/).
- A basic 3D scene with a block grid and keyboard camera movement.
- Custom Bevy materials using WGSL block and terrain shaders in `assets/shaders/`.
- A guest-first access screen; email login and signup are visible but locked until full release.
- A plain HTML/CSS/JavaScript landing page in `website/`.
- A Cloudflare D1 Worker auth scaffold in `auth/`; its API is disabled until configured for release.
- An Android arm64 debug APK workflow in GitHub Actions.
- A Windows x64 release build workflow in GitHub Actions.

## Run the prototype

You’ll need a recent stable Rust toolchain. From the project root:

```sh
cargo run
```

Choose **Continue as guest** to enter the sandbox. Email login and signup remain locked; the client does not collect email or call the auth API. Use **WASD** or the **arrow keys** to move the camera. Block placement, saving, and multiplayer are not implemented yet.

## Preview the website

`website/` is a guest-only, local-save block-building playground. Open `website/index.html` in a browser for development, or follow `website/README.md` to produce the minified and obfuscated `website/dist/` deployment.

## Windows desktop build

The **Windows desktop build** workflow uses `Dockerfile` to cross-compile a 64-bit Windows executable and uploads it as the `openblocks-windows-x64` artifact. It runs on pushes to `main`/`master`, pull requests, or when started manually from the Actions tab. Download the executable from the workflow run’s **Artifacts** section.

To build locally with Docker installed, run these commands from the project root:

```sh
docker build --target windows-artifact --tag openblocks-windows .
docker create --name openblocks-windows-artifact openblocks-windows
docker cp openblocks-windows-artifact:/openblocks.exe ./openblocks.exe
docker cp openblocks-windows-artifact:/assets ./assets
docker rm openblocks-windows-artifact
```

The executable is written to `./openblocks.exe`; keep the extracted `assets/` directory next to it so the WGSL shaders can load. The Docker image cross-compiles the program; it does not run the Windows GUI inside the Linux container.

## D1 login backend scaffold

`auth/` contains a Cloudflare Worker API, D1 migration, and setup instructions. It supports email signup/login/session endpoints, but `AUTH_ENABLED` is false by default and the client UI remains locked. Create your D1 database and follow `auth/README.md` to bind it; do not enable the API publicly until you configure the allowed origin and rate limiting.

## Android beta build

The **Android beta build** workflow compiles the Rust game for `arm64-v8a`, packages it as a debug APK, and uploads the APK as a workflow artifact. It runs on pushes to `main`/`master`, pull requests, or when started manually from the Actions tab.

To build locally, install the Android SDK/NDK and Gradle, then run:

```sh
cargo install cargo-ndk
cargo ndk -t arm64-v8a -o android/app/src/main/jniLibs build --release --lib
mkdir -p android/app/src/main/assets
cp -R assets/. android/app/src/main/assets/
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
