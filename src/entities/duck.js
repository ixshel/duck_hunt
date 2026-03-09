export function createDuck({ x, y, dir, speed, level }) {
  return {
    x, y, dir, speed, level,
    width: 32,
    height: 24,
    alive: true,
    escaping: false,
    dead: false,
    remove: false,
    animTime: Math.random(),
    frame: 0,
    value: 500 + level * 50,
    hitRadius: 10,
    vx: dir * speed,
    vy: -5,
    wobbleT: Math.random() * 10,

    hit() {
      if (!this.alive) return;
      this.alive = false;
      this.dead = true;
      this.frame = 3;
      this.vx = 0;
      this.vy = 35;
    },

    update(dt) {
      this.animTime += dt;
      if (this.alive) {
        this.wobbleT += dt * (2 + this.level * 0.25);
        this.frame = Math.floor(this.animTime * 10) % 3;
        this.vy = Math.sin(this.wobbleT) * (7 + this.level) - (5 + this.level * 0.8);
        if (this.escaping) this.vy -= (18 + this.level);
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.y < 24) this.escaping = true;
        if (this.x < -40 || this.x > 296 || this.y < -40) this.remove = true;
      } else {
        this.y += this.vy * dt;
        this.vy += 120 * dt;
        if (this.y > 260) this.remove = true;
      }
    },

    isHit(cx, cy) {
      const dx = cx - (this.x + 16);
      const dy = cy - (this.y + 12);
      return dx * dx + dy * dy <= this.hitRadius * this.hitRadius;
    }
  };
}
