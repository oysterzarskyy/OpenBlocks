# OpenBlocks guest web playground

The web build is a standalone, guest-only block playground. Email login/signup are not shown or called here; the beta world is saved locally in the current browser and can be exported as JSON.

## Preview source

Open `index.html` in a browser with an internet connection (jQuery is loaded from the official CDN), or serve the `website/` directory locally.

## Build production files

Requires Node.js/npm. From `website/`:

```sh
npm install
npm run build
```

The production site is written to `dist/`. The build minifies HTML/CSS/JavaScript, obfuscates the application JavaScript, and copies the pinned jQuery dependency locally. Deploy only `dist/` if you want to avoid publishing the readable source files.

Obfuscation and context-menu/drag deterrents only discourage casual copying. Browser-delivered code and pixels can always be inspected or captured; never put credentials, private keys, or security-critical logic in this frontend.
