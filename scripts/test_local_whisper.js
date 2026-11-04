const { pipeline } = require('@xenova/transformers');
const path = require('path');
const fs = require('fs');

async function test() {
  console.log('Loading Whisper pipeline...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
  console.log('Whisper pipeline loaded successfully!');
}

test().catch(e => console.error('Error:', e));
