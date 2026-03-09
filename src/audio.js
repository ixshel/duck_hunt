export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buffers = new Map();

  async function load(name, url) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    buffers.set(name, buf);
  }

  function play(name, volume = 0.85) {
    const buf = buffers.get(name);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  async function unlock() {
    if (ctx.state !== "running") await ctx.resume();
  }

  return { load, play, unlock };
}
