import { createEngine } from "./engine.js";
import { createHandController } from "./hand.js";
import { createAudio } from "./audio.js";
import { loadImage } from "./sprites.js";
import { createRoundScene } from "./scenes/round.js";

const canvas = document.getElementById("screen");
const videoEl = document.getElementById("cam");
const handStatusEl = document.getElementById("handStatus");

const engine = createEngine(canvas);
const audio = createAudio();

const assets = {
  bg: await loadImage("./assets/img/bg.png"),
  duck: await loadImage("./assets/img/duck.png"),
  dog: await loadImage("./assets/img/dog.png"),
};

await Promise.all([
  audio.load("shoot", "./assets/sfx/shoot.wav"),
  audio.load("hit", "./assets/sfx/hit.wav"),
  audio.load("miss", "./assets/sfx/miss.wav"),
  audio.load("dog_laugh", "./assets/sfx/dog_laugh.wav"),
  audio.load("dog_catch", "./assets/sfx/dog_catch.wav"),
  audio.load("round_start", "./assets/sfx/round_start.wav"),
]);

const scene = createRoundScene({ audio, assets });

let useMouse = false;
let paused = false;

const hand = createHandController({
  videoEl,
  onAim: (nx, ny) => {
    if (!useMouse) scene.setAim(nx, ny);
  },
  onTrigger: (nx, ny) => {
    if (!useMouse) scene.shootAt(nx, ny);
  },
  onStatus: (status) => {
    handStatusEl.textContent = status;
  }
});

await hand.start();

window.addEventListener("pointermove", (e) => {
  if (!useMouse) return;
  const p = engine.screenToBuffer(e.clientX, e.clientY);
  scene.cross.visible = true;
  scene.cross.x = Math.max(0, Math.min(255, p.x));
  scene.cross.y = Math.max(0, Math.min(239, p.y));
});

window.addEventListener("click", async () => {
  await audio.unlock();
  if (useMouse) scene.shoot();
}, { passive: true });

window.addEventListener("keydown", async (e) => {
  await audio.unlock();
  if (e.key === "Escape") paused = !paused;
  if (e.key === "r" || e.key === "R") scene.ammo = 3;
  if (e.key === "m" || e.key === "M") useMouse = !useMouse;
});

let last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  if (!paused) scene.update(dt);

  engine.bctx.clearRect(0, 0, 256, 240);
  scene.draw(engine.bctx);
  engine.present();
}
requestAnimationFrame(loop);
