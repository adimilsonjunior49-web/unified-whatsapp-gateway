const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const FormData = require('form-data');
const axios = require('axios');

const tempWav = path.join(__dirname, 'temp_test.wav');
const ffmpegPath = 'C:\\Users\\Home\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe';

try {
  execSync(`"${ffmpegPath}" -y -f lavfi -i "sine=frequency=1000:duration=1" "${tempWav}"`, { stdio: 'ignore' });
} catch (e) {
  console.error('FFmpeg error:', e.message);
}

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream(tempWav));
  form.append('model', 'whisper-1');

  try {
    const res = await axios.post('http://localhost:3001/v1/audio/transcriptions', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer freellmapi-2157a362e1cfa893332caaa48df54c92974dcd5a04ab0d94'
      },
      timeout: 10000
    });
    console.log('Transcription Success:', res.status, res.data);
  } catch (err) {
    console.log('Transcription Error:', err.response?.status, err.response?.data || err.message);
  } finally {
    try { fs.unlinkSync(tempWav); } catch (_) {}
  }
}

test();
