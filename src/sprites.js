export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function drawCrosshair(bctx, x, y) {
  const s = 10;
  const c = 4;
  bctx.strokeStyle = "#67E8F9";
  bctx.lineWidth = 2;
  bctx.beginPath();
  bctx.moveTo(x - s, y - s + c); bctx.lineTo(x - s, y - s); bctx.lineTo(x - s + c, y - s);
  bctx.moveTo(x + s - c, y - s); bctx.lineTo(x + s, y - s); bctx.lineTo(x + s, y - s + c);
  bctx.moveTo(x + s, y + s - c); bctx.lineTo(x + s, y + s); bctx.lineTo(x + s - c, y + s);
  bctx.moveTo(x - s + c, y + s); bctx.lineTo(x - s, y + s); bctx.lineTo(x - s, y + s - c);
  bctx.stroke();
}

export function drawHud(bctx, scene) {
  const pad = (n) => String(n).padStart(6, "0");
  bctx.fillStyle = "#88d488";
  bctx.font = "10px monospace";
  bctx.fillText(`R${scene.round}`, 18, 220);
  bctx.fillText(`SHOT`, 18, 235);
  bctx.fillText(String(scene.ammo), 48, 235);

  bctx.fillText(`HIT`, 92, 220);
  for (let i = 0; i < 10; i++) {
    bctx.fillStyle = scene.hitsBar[i] === true ? "#d16f5d" : (scene.hitsBar[i] === false ? "#a8a8a8" : "#4b4b4b");
    bctx.fillRect(116 + i * 8, 213, 6, 6);
  }

  bctx.fillStyle = "#fff";
  bctx.fillText(`SCORE`, 188, 220);
  bctx.fillText(pad(scene.score), 182, 235);

  if (scene.flyAwayTimer > 0) {
    bctx.fillStyle = "#fff";
    bctx.fillText("FLY AWAY", 102, 112);
  }
}

export function drawSpriteFrame(bctx, img, frameW, frameH, frame, x, y, flipX = false) {
  bctx.save();
  if (flipX) {
    bctx.translate(Math.floor(x) + frameW, Math.floor(y));
    bctx.scale(-1, 1);
    bctx.drawImage(img, frame * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
  } else {
    bctx.drawImage(img, frame * frameW, 0, frameW, frameH, Math.floor(x), Math.floor(y), frameW, frameH);
  }
  bctx.restore();
}
