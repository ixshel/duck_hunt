export function createHandController({ videoEl, onAim, onTrigger, onStatus }) {
  const ctl = {
    enabled: true,
    mirrorX: true,
    smoothX: 0.5,
    smoothY: 0.5,
    smoothFactor: 0.34,
    fastSmoothFactor: 0.58,
    fastMoveThreshold: 0.035,
    fistThreshold: 1.16,
    trackingGraceMs: 180,
    triggerActive: false,
    cooldownMs: 180,
    lastShotAt: 0,
    lastTrackedAt: 0,
    status: "searching",
  };

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.45,
  });

  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const fingerCurlRatio = (lm, wrist, tipIndex, mcpIndex) =>
    dist(lm[tipIndex], wrist) / Math.max(dist(lm[mcpIndex], wrist), 0.001);
  const setStatus = (status) => {
    if (ctl.status === status) return;
    ctl.status = status;
    onStatus?.(status);
  };

  hands.onResults((results) => {
    const list = results.multiHandLandmarks;
    if (!ctl.enabled) return;
    if (!list || list.length === 0) {
      if ((Date.now() - ctl.lastTrackedAt) > ctl.trackingGraceMs) {
        ctl.triggerActive = false;
        setStatus("searching");
      }
      return;
    }

    const lm = list[0];
    const wrist = lm[0];
    const indexMcp = lm[5];
    const middleMcp = lm[9];
    const indexTip = lm[8];
    const indexCurl = fingerCurlRatio(lm, wrist, 8, 5);
    const middleCurl = fingerCurlRatio(lm, wrist, 12, 9);
    const ringCurl = fingerCurlRatio(lm, wrist, 16, 13);
    const pinkyCurl = fingerCurlRatio(lm, wrist, 20, 17);
    const isClosedFist = (
      indexCurl < ctl.fistThreshold &&
      middleCurl < ctl.fistThreshold &&
      ringCurl < ctl.fistThreshold &&
      pinkyCurl < ctl.fistThreshold
    );

    let nx = indexTip.x;
    let ny = indexTip.y;
    if (ctl.mirrorX) nx = 1 - nx;

    if (!isClosedFist) {
      const moveDelta = Math.hypot(nx - ctl.smoothX, ny - ctl.smoothY);
      const smoothFactor = moveDelta > ctl.fastMoveThreshold
        ? ctl.fastSmoothFactor
        : ctl.smoothFactor;

      ctl.smoothX = lerp(ctl.smoothX, nx, smoothFactor);
      ctl.smoothY = lerp(ctl.smoothY, ny, smoothFactor);

      onAim?.(ctl.smoothX, ctl.smoothY);
    }

    ctl.lastTrackedAt = Date.now();
    setStatus("tracking");

    const now = Date.now();
    const canShoot = (now - ctl.lastShotAt) > ctl.cooldownMs;

    if (isClosedFist && !ctl.triggerActive && canShoot) {
      ctl.lastShotAt = now;
      onTrigger?.(ctl.smoothX, ctl.smoothY);
    }
    ctl.triggerActive = isClosedFist;
  });

  async function start() {
    try {
      const cam = new Camera(videoEl, {
        onFrame: async () => { await hands.send({ image: videoEl }); },
        width: 640,
        height: 480,
      });
      await cam.start();
      setStatus("searching");
    } catch (err) {
      console.error(err);
      setStatus("off");
      alert("Camera access failed. Grant webcam permissions and reload.");
    }
  }

  return { ctl, start };
}
