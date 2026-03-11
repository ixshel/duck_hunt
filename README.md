# Duck Hunt Hand

A browser game inspired by classic duck-shooting gameplay, rebuilt with:

- NES-style 256x240 pixel rendering
- Webcam hand controls with MediaPipe Hands
- Index finger = aim
- Thumb + index pinch or a closed fist = shoot
- Mouse fallback
- Custom original sprites included in this project
- Retro-style original sound effects included in this project

## Important note

This zip includes **custom original-made assets**, not Nintendo assets.

## Run locally

Because webcam access requires a local server, do not open `index.html` directly.

### Option 1: Python
```bash
python3 -m http.server 8080
```

### Option 2: Node
```bash
npx http-server -p 8080
```

Then open:

```text
http://localhost:8080
```

## Controls

- Hand mode: index finger aims, pinch or close fist shoots
- Mouse mode: move + click
- `M` toggles mouse/hand preference
- `R` reload current wave ammo
- `Esc` pause

## Tune hand tracking

Edit `src/hand.js`:

- `pinchThreshold`: raise if pinches are not detected enough
- `fistThreshold`: raise if making a fist does not shoot reliably
- `smoothFactor`: lower if cursor shakes too much
- `cooldownMs`: raise if it double-shoots
