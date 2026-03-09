export function createHandController({ videoEl, onAim, onTrigger, onStatus }) {
  const ctl = {
    enabled: true,
    mirrorX: true,
    smoothX: 0.5,
    smoothY: 0.5,
    smoothFactor: 0.22,
    pinchThreshold: 0.045,
    wasPinching: false,
    cooldownMs: 220,
    lastShotAt: 0,
  };

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  hands.onResults((results) => {
    const list = results.multiHandLandmarks;
    if (!ctl.enabled || !list || list.length === 0) return;

    const lm = list[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];

    let nx = indexTip.x;
    let ny = indexTip.y;
    if (ctl.mirrorX) nx = 1 - nx;

    ctl.smoothX = lerp(ctl.smoothX, nx, ctl.smoothFactor);
    ctl.smoothY = lerp(ctl.smoothY, ny, ctl.smoothFactor);

    onAim?.(ctl.smoothX, ctl.smoothY);

    const isPinching = dist(thumbTip, indexTip) < ctl.pinchThreshold;
    const now = Date.now();
    const canShoot = (now - ctl.lastShotAt) > ctl.cooldownMs;

    if (isPinching && !ctl.wasPinching && canShoot) {
      ctl.lastShotAt = now;
      onTrigger?.();
    }
    ctl.wasPinching = isPinching;
  });

  async function start() {
    try {
      const cam = new Camera(videoEl, {
        onFrame: async () => { await hands.send({ image: videoEl }); },
        width: 640,
        height: 480,
      });
      await cam.start();
      onStatus?.("on");
    } catch (err) {
      console.error(err);
      onStatus?.("off");
      alert("Camera access failed. Grant webcam permissions and reload.");
    }
  }

  return { ctl, start };
}
