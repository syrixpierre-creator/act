const DEV_NUMBER = '27697344852';

export default {
  name: 'owner',
  alias: ['dev', 'developer'],
  description: 'Send the developer\'s contact card.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:INCONNU BOY SENSEI\n' +
      'ORG:QUEEN AKUMA V4;\n' +
      `TEL;type=CELL;type=VOICE;waid=${DEV_NUMBER}:+${DEV_NUMBER}\n` +
      'END:VCARD';

    await sock.sendMessage(chatId, {
      contacts: {
        displayName: 'INCONNU BOY SENSEI',
        contacts: [{ vcard }]
      }
    }, { quoted: msg });
  }
};
