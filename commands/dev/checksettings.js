import { safeErrorMessage } from '../../lib/utils/errors.js';
import fs from 'fs';
import path from 'path';
import { currentDataDir } from '../../lib/sessionContext.js';

export default {
  name: 'checksettings',
  ownerOnly: true,
  strictOwner: true,
  description: 'Validate every JSON settings/state file for corruption (owner only). Usage: .checksettings',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const dataDir = currentDataDir();
    const files = [
      path.join(dataDir, 'settings.json'), path.join(dataDir, 'group_settings.json'),
      'bot_mode.json', 'prefix_config.json', 'bot_settings.json', 'owner.json'
    ];
    const results = [];
    for (const rel of files) {
      const full = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
      const label = path.isAbsolute(rel) ? path.basename(rel) : rel;
      if (!fs.existsSync(full)) { results.push(`⚪ ${label} — not created yet`); continue; }
      try {
        const raw = fs.readFileSync(full, 'utf8');
        if (raw.trim()) JSON.parse(raw);
        results.push(`✅ ${label} — OK`);
      } catch (e) {
        results.push(`❌ ${label} — CORRUPTED: ${safeErrorMessage(e)}`);
      }
    }
    await sock.sendMessage(chatId, { text: `🩺 *Settings File Check*\n\n${results.join('\n')}` }, { quoted: msg });
  }
};
