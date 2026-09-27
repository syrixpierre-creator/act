// Current display brand ("QUEEN AKUMA V4") for code that has no `ctx` at hand
// (group events, the global sendMessage wrapper). Honours .setbotname, which
// saves ./data/botname.json, then BOT_NAME, then the built-in default.
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { currentDataDir } from './sessionContext.js';

export function currentBotName() {
  try {
    const file = path.join(currentDataDir(), 'botname.json');
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (saved?.name) return String(saved.name);
  } catch { /* no saved name */ }
  return config.bot.name;
}

export function currentBrand() {
  const name = currentBotName().toUpperCase();
  const major = String(config.version || '2').split('.')[0];
  return /\bV\d+$/.test(name) ? name : `${name} V${major}`;
}
