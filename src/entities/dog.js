export function createDog() {
  return {
    mode: "hidden",
    t: 0,
    y: 176,
    x: 112,
    frame: 0,
    visible: false,

    show(mode) {
      this.mode = mode;
      this.t = 0;
      this.visible = true;
    },

    hide() {
      this.mode = "hidden";
      this.t = 0;
      this.visible = false;
    },

    update(dt) {
      this.t += dt;
      if (!this.visible) return;

      if (this.mode === "laugh") {
        this.frame = Math.floor(this.t * 6) % 2 ? 1 : 2;
      } else if (this.mode === "catch") {
        this.frame = 3;
      } else {
        this.frame = 0;
      }
    }
  };
}
