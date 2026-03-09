export const VW = 256;
export const VH = 240;

export function createEngine(canvas) {
  const ctx = canvas.getContext("2d");
  const buffer = document.createElement("canvas");
  buffer.width = VW;
  buffer.height = VH;
  const bctx = buffer.getContext("2d");

  ctx.imageSmoothingEnabled = false;
  bctx.imageSmoothingEnabled = false;

  const view = { scale: 1, dx: 0, dy: 0 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }

  function present() {
    const scale = Math.max(1, Math.floor(Math.min(canvas.width / VW, canvas.height / VH)));
    const dw = VW * scale;
    const dh = VH * scale;
    const dx = Math.floor((canvas.width - dw) / 2);
    const dy = Math.floor((canvas.height - dh) / 2);

    view.scale = scale;
    view.dx = dx;
    view.dy = dy;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buffer, 0, 0, VW, VH, dx, dy, dw, dh);
  }

  function screenToBuffer(x, y) {
    return {
      x: (x - view.dx) / view.scale,
      y: (y - view.dy) / view.scale,
    };
  }

  window.addEventListener("resize", resize);
  resize();

  return { ctx, bctx, buffer, view, present, screenToBuffer };
}
