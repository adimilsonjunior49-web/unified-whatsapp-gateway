import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  HOST: process.env.HOST || '0.0.0.0',
  API_SECRET_KEY: process.env.API_SECRET_KEY || 'default_secret_key_change_me',
  SESSIONS_DIR: path.resolve(process.cwd(), process.env.SESSIONS_DIR || 'sessions'),
  TEMP_DIR: path.resolve(process.cwd(), process.env.TEMP_DIR || 'temp'),
  DEFAULT_WEBHOOK_URL: process.env.DEFAULT_WEBHOOK_URL || '',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
  CHATWOOT: {
    ENABLED: process.env.CHATWOOT_ENABLED === 'true',
    BASE_URL: process.env.CHATWOOT_BASE_URL || '',
    API_TOKEN: process.env.CHATWOOT_API_TOKEN || ''
  },
  TYPEBOT: {
    ENABLED: process.env.TYPEBOT_ENABLED === 'true',
    BASE_URL: process.env.TYPEBOT_BASE_URL || ''
  },
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg'
};
