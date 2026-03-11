import { createDuck } from "../entities/duck.js";
import { createDog } from "../entities/dog.js";
import { drawHud, drawSpriteFrame, drawCrosshair } from "../sprites.js";

export function createRoundScene({ audio, assets }) {
  const dog = createDog();

  const scene = {
    bg: assets.bg,
    duckImg: assets.duck,
    dogImg: assets.dog,
    round: 1,
    level: 1,
    score: 0,
    ammoMax: 3,
    ammo: 3,
    ducksLaunched: 0,
    totalDucksThisRound: 10,
    ducksResolved: 0,
    hitsBar: [],
    flyAwayTimer: 0,
    roundDelay: 1.25,
    roundState: "intro",
    waveCooldown: 0,
    cross: { x: 128, y: 120, visible: true },
    ducks: [],
    dog,

    beginRound() {
      this.ducks = [];
      this.ducksLaunched = 0;
      this.ducksResolved = 0;
      this.hitsBar = [];
      this.ammo = 3;
      this.flyAwayTimer = 0;
      this.roundDelay = 1.0;
      this.roundState = "intro";
      this.waveCooldown = 0;
      dog.hide();
      audio.play("round_start", 0.75);
    },

    launchWave() {
      const count = this.level < 4 ? 1 : 2;
      this.ammo = 3;
      this.waveCooldown = 1.0;

      for (let i = 0; i < count && this.ducksLaunched < this.totalDucksThisRound; i++) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const x = dir === 1 ? -28 : 252;
        const y = 120 + Math.random() * 36;
        const speed = 38 + this.level * 7 + Math.random() * 18;
        this.ducks.push(createDuck({ x, y, dir, speed, level: this.level }));
        this.ducksLaunched++;
      }
    },

    setAim(nx, ny) {
      this.cross.x = Math.max(0, Math.min(255, nx * 256));
      this.cross.y = Math.max(0, Math.min(239, ny * 240));
      this.cross.visible = true;
    },

    shootAt(nx, ny) {
      this.setAim(nx, ny);
      this.shoot();
    },

    markMisses(count) {
      while (count-- > 0 && this.hitsBar.length < this.totalDucksThisRound) {
        this.hitsBar.push(false);
      }
    },

    shoot() {
      if (this.roundState !== "active" || this.ammo <= 0) return;

      this.ammo--;
      audio.play("shoot", 0.8);

      let hit = false;
      for (const duck of this.ducks) {
        if (duck.alive && duck.isHit(this.cross.x, this.cross.y)) {
          duck.hit();
          this.score += duck.value;
          this.hitsBar.push(true);
          audio.play("hit", 0.9);
          hit = true;
          break;
        }
      }

      if (!hit) audio.play("miss", 0.55);

      const anyAlive = this.ducks.some((d) => d.alive);
      if (this.ammo === 0 && anyAlive) {
        this.flyAwayTimer = 1.1;
        for (const duck of this.ducks) if (duck.alive) duck.escaping = true;
      }
    },

    finishWave(mode, resolvedCount) {
      this.waveCooldown = 1.0;

      if (mode === "laugh") {
        dog.show("laugh");
        audio.play("dog_laugh", 0.85);
      } else if (mode === "catch") {
        dog.show("catch");
        audio.play("dog_catch", 0.85);
      }
      this.markMisses(resolvedCount);
      this.ducks = [];
    },

    nextRound() {
      this.round++;
      if (this.round % 2 === 0) this.level++;
      this.beginRound();
    },

    update(dt) {
      dog.update(dt);

      if (this.roundState === "intro") {
        this.roundDelay -= dt;
        if (this.roundDelay <= 0) {
          this.roundState = "active";
          this.launchWave();
        }
      }

      if (this.roundState === "active") {
        if (this.flyAwayTimer > 0) this.flyAwayTimer -= dt;

        for (const duck of this.ducks) duck.update(dt);

        const aliveCount = this.ducks.filter((d) => d.alive).length;
        const deadFallingCount = this.ducks.filter((d) => !d.alive && !d.remove).length;
        const removedCount = this.ducks.filter((d) => d.remove).length;

        if (removedCount > 0) {
          this.ducks = this.ducks.filter((d) => !d.remove);
        }

        const noTargetsLeft = this.ducks.length === 0;
        const outOfAmmo = this.ammo === 0;

        if (noTargetsLeft && this.waveCooldown > 0) {
          this.waveCooldown -= dt;
          if (this.waveCooldown <= 0) {
            dog.hide();
            if (this.ducksLaunched < this.totalDucksThisRound) {
              this.launchWave();
            } else {
              this.roundState = "transition";
              this.roundDelay = 1.2;
            }
          }
          return;
        }

        if (outOfAmmo && aliveCount > 0) {
          const misses = this.ducks.filter((d) => d.alive).length;
          this.finishWave("laugh", misses);
        } else if (aliveCount === 0 && deadFallingCount === 0 && this.ducks.length > 0) {
          // safety
          this.finishWave("catch", 0);
        } else if (aliveCount === 0 && deadFallingCount === 0 && this.ducks.length === 0) {
          // handled by wave cooldown
        } else if (aliveCount === 0 && this.ducks.every((d) => !d.alive)) {
          this.waveCooldown -= dt;
          if (this.waveCooldown <= 0) {
            this.finishWave("catch", 0);
          }
        }
      }

      if (this.roundState === "transition") {
        this.roundDelay -= dt;
        if (this.roundDelay <= 0) this.nextRound();
      }
    },

    draw(bctx) {
      bctx.drawImage(this.bg, 0, 0);

      for (const duck of this.ducks) {
        drawSpriteFrame(bctx, this.duckImg, 32, 24, duck.frame, duck.x, duck.y, duck.dir < 0);
      }

      if (dog.visible) {
        drawSpriteFrame(bctx, this.dogImg, 32, 32, dog.frame, dog.x, dog.y);
      }

      drawHud(bctx, this);
      if (this.cross.visible) drawCrosshair(bctx, this.cross.x, this.cross.y);
    }
  };

  scene.beginRound();
  return scene;
}
