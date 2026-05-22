import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix }) => {
  const buttons = {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '👁️ OWNER',
      sections: [
        {
          title: '📋 CONTACTOS',
          rows: [
            {
              header: '👁️ EL Vigilante',
              title: 'Creador de Saki Bot',
              description: 'wa.me/59177474230',
              id: `${usedPrefix}owner`
            },
            {
              header: '🤝 LEO',
              title: 'Mano Derecha',
              description: 'wa.me/584241819270',
              id: `${usedPrefix}owner`
            }
          ]
        }
      ]
    })
  }

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: { title: 'Saki - ѕυв', subtitle: 'Información del Creador', hasMediaAttachment: false },
    body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *CREADOR ::* EL VIGILANTE
𑁍𓂃 𓈒𓏸 *MANO DERECHA ::* Leo
𑁍𓂃 𓈒𓏸 *NÚMERO CREADOR ::* wa.me/59177474230
𑁍𓂃 𓈒𓏸 *NÚMERO LEO ::* wa.me/584241819270

> *Toca el botón para ver los contactos*

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*` },
    footer: { text: '⫏⫏ Saki - вσт ✿' },
    nativeFlowMessage: { buttons: [buttons] }
  })

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'dueño']

export default handler