import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let partidas = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat
  const userId = m.sender

  if (!partidas[userId]) {
    const numero = Math.floor(Math.random() * 100) + 1
    partidas[userId] = {
      numero,
      intentos: 0,
      max: 7
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - 🎮 JUEGO',
        subtitle: 'Adivina el número',
        hasMediaAttachment: false
      },
      body: {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *JUEGO ::* Adivina el número
𑁍𓂃 𓈒𓏸 *RANGO ::* 1 al 100
𑁍𓂃 𓈒𓏸 *INTENTOS ::* 7 máximo

> Escribe un número del 1 al 100`
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎮 OPCIONES',
            sections: [{
              title: '⚙️ ACCIONES',
              rows: [
                {
                  header: '🚪 SALIR',
                  title: '❌ RENDIRSE',
                  description: 'Terminar la partida actual',
                  id: `rendirse_${userId}`
                }
              ]
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  // Si hay partida activa, procesar intento
  const partida = partidas[userId]
  const intento = parseInt(text?.trim())

  if (isNaN(intento) || intento < 1 || intento > 100) {
    await conn.sendMessage(m.chat, { text: `❌ Escribe un número válido del 1 al 100` }, { quoted: m })
    return
  }

  partida.intentos++
  const restantes = partida.max - partida.intentos

  if (intento === partida.numero) {
    delete partidas[userId]
    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - 🎮 JUEGO',
        subtitle: '¡Ganaste!',
        hasMediaAttachment: false
      },
      body: {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *RESULTADO ::* ¡GANASTE! 🎉
𑁍𓂃 𓈒𓏸 *NÚMERO ::* ${partida.numero}
𑁍𓂃 𓈒𓏸 *INTENTOS USADOS ::* ${partida.intentos}`
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎮 OPCIONES',
            sections: [{
              title: '⚙️ ACCIONES',
              rows: [{
                header: '🔄 NUEVA',
                title: '🎮 JUGAR DE NUEVO',
                description: 'Iniciar una nueva partida',
                id: 'numero'
              }]
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🎉')
    return
  }

  if (partida.intentos >= partida.max) {
    const numero = partida.numero
    delete partidas[userId]
    await conn.sendMessage(m.chat, {
      text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *RESULTADO ::* ¡PERDISTE! 😔
𑁍𓂃 𓈒𓏸 *EL NÚMERO ERA ::* ${numero}

> Escribe *${usedPrefix}numero* para jugar de nuevo`
    }, { quoted: m })
    await m.react('😔')
    return
  }

  const pista = intento < partida.numero ? '📈 El número es *mayor*' : '📉 El número es *menor*'

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: 'YO OFC - 🎮 JUEGO',
      subtitle: 'Adivina el número',
      hasMediaAttachment: false
    },
    body: {
      text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TU NÚMERO ::* ${intento}
𑁍𓂃 𓈒𓏸 *PISTA ::* ${pista}
𑁍𓂃 𓈒𓏸 *INTENTOS RESTANTES ::* ${restantes}

> Escribe otro número`
    },
    footer: {
      text: '⫏⫏ YO OFC - вσт ✿'
    },
    nativeFlowMessage: {
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '🎮 OPCIONES',
          sections: [{
            title: '⚙️ ACCIONES',
            rows: [{
              header: '🚪 SALIR',
              title: '❌ RENDIRSE',
              description: 'Terminar la partida actual',
              id: `rendirse_${userId}`
            }]
          }]
        })
      }]
    }
  })

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage
        }
      }
    },
    { quoted: m }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  await m.react('🎮')
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    if (!id) return false

    if (id.startsWith('rendirse_')) {
      const userId = id.replace('rendirse_', '')
      const partida = partidas[userId]

      if (!partida) {
        await conn.sendMessage(m.chat, { text: `❌ No tienes una partida activa.` }, { quoted: m })
        return true
      }

      const numero = partida.numero
      delete partidas[userId]

      await conn.sendMessage(m.chat, {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *RESULTADO ::* Te rendiste 😅
𑁍𓂃 𓈒𓏸 *EL NÚMERO ERA ::* ${numero}`
      }, { quoted: m })

      await m.react('😅')
      return true
    }

    if (id === 'numero') {
      const plugin = Object.values(global.plugins).find(p => {
        if (p.disabled) return false
        const cmds = Array.isArray(p.command) ? p.command : [p.command]
        return cmds.includes('numero')
      })

      if (!plugin) return false

      m.text = ''
      m.body = 'numero'

      await plugin(m, {
        conn,
        text: '',
        usedPrefix: '!',
        command: 'numero',
        args: [],
        v: m
      })

      return true
    }

    return false

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help = ['numero']
handler.tags = ['game']
handler.command = ['numero', 'numgame', 'adivina']

export default handler