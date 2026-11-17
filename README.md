# animouse examples

The page at https://jango-git.github.io/animouse/. Each tab is one example, and its code is in
`src/scenes`.

The page code in `src` runs as it is, without a build. The import map in `index.html` points the
libraries at `vendor`, which holds three, laymur and animouse bundled and minified from npm.

## Libraries

```bash
npm install
npm run build
```

The build writes `vendor` and copies the fonts. After updating a library, run both commands
again, and change `VERSION` in `src/interface.js` for a new animouse release. The page runs from
any static server, for example `python3 -m http.server`.

## Assets

`assets/SK_Character.glb` is the character with its clips rebuilt to start at 0, and the
locomotion clips as closed cycles that start at the left foot contact. It is compressed with
gltf-transform:

```bash
gltf-transform resample source.glb resampled.glb --tolerance 0.0001
gltf-transform prune resampled.glb pruned.glb --keep-attributes false
gltf-transform meshopt pruned.glb SK_Character.glb --level high
```

The fonts are Space Grotesk and Ubuntu Sans Mono from fontsource, with their licenses in `fonts`.
