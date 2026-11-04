const fs = require('fs');
const { WaveFile } = require('wavefile');

async function test() {
  const { pipeline } = await import('@xenova/transformers');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');

  // Fetch JFK sample audio
  const res = await fetch('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav');
  const buffer = Buffer.from(await res.arrayBuffer());

  const wav = new WaveFile(buffer);
  wav.toBitDepth('32f');
  wav.toSampleRate(16000);
  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const sc = audioData[0].length;
      const merged = new Float32Array(sc);
      for (let i = 0; i < sc; ++i) {
        merged[i] = 0.5 * (audioData[0][i] + audioData[1][i]);
      }
      audioData = merged;
    } else {
      audioData = audioData[0];
    }
  }

  console.log('Running transcriber on Float32Array...');
  const result = await transcriber(audioData);
  console.log('Result:', result);
}

test().catch(console.error);
