let handler = async (m, { conn, usedPrefix }) => {
  let vcard1 = `BEGIN:VCARD
VERSION:3.0
FN:EL VIGILANTE
ORG:Creador de Saki Bot;
TITLE:👁️ Owner
TEL;waid=59177474230:+59177474230
EMAIL:elvigilante@sakibot.com
NOTE:🔒 Creador y desarrollador de Saki Bot
END:VCARD`

  let vcard2 = `BEGIN:VCARD
VERSION:3.0
FN:Leo
ORG:Mano Derecha de Saki Bot;
TITLE:🤝 Mano Derecha
TEL;waid=584241819270:+584241819270
NOTE:🤝 Mano Derecha y administrador de Saki Bot
END:VCARD`

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Equipo Saki Bot',
      contacts: [{ vcard: vcard1 }, { vcard: vcard2 }]
    }
  }, { quoted: m })
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'dueño']

export default handler