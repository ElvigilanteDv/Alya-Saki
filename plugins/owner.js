import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix }) => {
  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: 'YO OFC - вσт',
      subtitle: '𑁍 Información del Creador',
      hasMediaAttachment: false
    },
    body: {
      text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *CREADOR ::* EL VIGILANTE
𑁍𓂃 𓈒𓏸 *EDAD ::* 14 años
𑁍𓂃 𓈒𓏸 *PAÍS ::* 🇭🇳 Honduras
𑁍𓂃 𓈒𓏸 *BOT ::* YO OFC
𑁍𓂃 𓈒𓏸 *CONTACTO ::* wa.me/59177474230

> 𑁍 Desarrollador hondureño de 14 años apasionado por la programación y los bots de WhatsApp ⸜(｡˃ ᵕ ˂ )⸝♡

> *Toca el botón para ver los links*`
    },
    footer: {
      text: '⫏⫏ YO OFC - вσт ✿'
    },
    nativeFlowMessage: {
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '𑁍 LINKS',
          sections: [{
            title: '📋 REDES Y CONTACTO',
            rows: [
              {
                header: '📞 CONTACTO',
                title: '𑁍 EL VIGILANTE',
                description: 'wa.me/59177474230',
                id: `contact_owner`
              },
              {
                header: '📢 CANAL',
                title: '𑁍 Canal de WhatsApp',
                description: 'whatsapp.com/channel/0029VbCOTaJ9RZAQPdiZ4J1K',
                id: `contact_canal`
              },
              {
                header: '💻 GITHUB',
                title: '𑁍 ElvigilanteDv',
                description: 'github.com/ElvigilanteDv',
                id: `contact_github`
              },
              {
                header: '👥 GRUPO',
                title: '𑁍 Grupo de YO OFC',
                description: 'chat.whatsapp.com/IQQCPHdjqUU50t5FgShLdd',
                id: `contact_grupo`
              }
            ]
          }]
        })
      }]
    }
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
  await m.react('👁️')
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null
    if (!id) return false

    const links = {
      contact_owner: 'https://wa.me/59177474230',
      contact_canal: 'https://whatsapp.com/channel/0029VbCOTaJ9RZAQPdiZ4J1K',
      contact_github: 'https://github.com/ElvigilanteDv',
      contact_grupo: 'https://chat.whatsapp.com/IQQCPHdjqUU50t5FgShLdd'
    }

    if (links[id]) {
      await conn.sendMessage(m.chat, {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *LINK ::* ${links[id]}`
      }, { quoted: m })
      return true
    }

    return false

  } catch (e) {
    console.error(e)
    return false
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'dueño']

export default handler