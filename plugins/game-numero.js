import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let partidas = {}

let handler = async (m, { conn, usedPrefix, command }) => {
  const userId = m.sender

  const numero = Math.floor(Math.random() * 50) + 1
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
𑁍𓂃 𓈒𓏸 *RANGO ::* 1 al 50
𑁍𓂃 𓈒𓏸 *INTENTOS ::* 7 máximo

> Selecciona un número del botón`
    },
    footer: {
      text: '⫏⫏ YO OFC - вσт ✿'
    },
    nativeFlowMessage: {
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '🎮 ELEGIR NÚMERO',
          sections: [
            {
              title: '🔢 1 - 10',
              rows: [1,2,3,4,5,6,7,8,9,10].map(n => ({
                header: '🎮',
                title: `Número ${n}`,
                description: `Adivinar el ${n}`,
                id: `num_${n}_${userId}`
              }))
            },
            {
              title: '🔢 11 - 20',
              rows: [11,12,13,14,15,16,17,18,19,20].map(n => ({
                header: '🎮',
                title: `Número ${n}`,
                description: `Adivinar el ${n}`,
                id: `num_${n}_${userId}`
              }))
            },
            {
              title: '🔢 21 - 30',
              rows: [21,22,23,24,25,26,27,28,29,30].map(n => ({
                header: '🎮',
                title: `Número ${n}`,
                description: `Adivinar el ${n}`,
                id: `num_${n}_${userId}`
              }))
            },
            {
              title: '🔢 31 - 40',
              rows: [31,32,33,34,35,36,37,38,39,40].map(n => ({
                header: '🎮',
                title: `Número ${n}`,
                description: `Adivinar el ${n}`,
                id: `num_${n}_${userId}`
              }))
            },
            {
              title: '🔢 41 - 50',
              rows: [41,42,43,44,45,46,47,48,49,50].map(n => ({
                header: '🎮',
                title: `Número ${n}`,
                description: `Adivinar el ${n}`,
                id: `num_${n}_${userId}`
              }))
            }
          ]
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

    if (id.startsWith('num_')) {
      const parts = id.split('_')
      const intento = parseInt(parts[1])
      const userId = parts[2]
      const partida = partidas[userId]

      if (!partida) {
        await conn.sendMessage(m.chat, { text: `❌ No tienes partida activa. Usa *!numero* para iniciar.` }, { quoted: m })
        return true
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
𑁍𓂃 𓈒𓏸 *INTENTOS USADOS ::* ${partida.intentos}

> Selecciona jugar de nuevo`
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
                    header: '🔄',
                    title: '🎮 JUGAR DE NUEVO',
                    description: 'Iniciar una nueva partida',
                    id: `nuevajugada_${userId}`
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
        return true
      }

      if (partida.intentos >= partida.max) {
        const numero = partida.numero
        delete partidas[userId]

        await conn.sendMessage(m.chat, {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *RESULTADO ::* ¡PERDISTE! 😔
𑁍𓂃 𓈒𓏸 *EL NÚMERO ERA ::* ${numero}
𑁍𓂃 𓈒𓏸 *INTENTOS USADOS ::* ${partida.intentos}`
        }, { quoted: m })

        await m.react('😔')
        return true
      }

      const pista = intento < partida.numero ? '📈 El número es *mayor*' : '📉 El número es *menor*'

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'YO OFC - 🎮 JUEGO',
          subtitle: 'Sigue intentando',
          hasMediaAttachment: false
        },
        body: {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TU NÚMERO ::* ${intento}
𑁍𓂃 𓈒𓏸 *PISTA ::* ${pista}
𑁍𓂃 𓈒𓏸 *INTENTOS RESTANTES ::* ${restantes}

> Selecciona otro número`
        },
        footer: {
          text: '⫏⫏ YO OFC - вσт ✿'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎮 ELEGIR NÚMERO',
              sections: [
                {
                  title: '🔢 1 - 10',
                  rows: [1,2,3,4,5,6,7,8,9,10].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 11 - 20',
                  rows: [11,12,13,14,15,16,17,18,19,20].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 21 - 30',
                  rows: [21,22,23,24,25,26,27,28,29,30].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 31 - 40',
                  rows: [31,32,33,34,35,36,37,38,39,40].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 41 - 50',
                  rows: [41,42,43,44,45,46,47,48,49,50].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                }
              ]
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
      return true
    }

    if (id.startsWith('nuevajugada_')) {
      const userId = id.replace('nuevajugada_', '')
      const numero = Math.floor(Math.random() * 50) + 1
      partidas[userId] = { numero, intentos: 0, max: 7 }

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'YO OFC - 🎮 JUEGO',
          subtitle: 'Adivina el número',
          hasMediaAttachment: false
        },
        body: {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *JUEGO ::* Adivina el número
𑁍𓂃 𓈒𓏸 *RANGO ::* 1 al 50
𑁍𓂃 𓈒𓏸 *INTENTOS ::* 7 máximo

> Selecciona un número del botón`
        },
        footer: {
          text: '⫏⫏ YO OFC - вσт ✿'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎮 ELEGIR NÚMERO',
              sections: [
                {
                  title: '🔢 1 - 10',
                  rows: [1,2,3,4,5,6,7,8,9,10].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 11 - 20',
                  rows: [11,12,13,14,15,16,17,18,19,20].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 21 - 30',
                  rows: [21,22,23,24,25,26,27,28,29,30].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 31 - 40',
                  rows: [31,32,33,34,35,36,37,38,39,40].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                },
                {
                  title: '🔢 41 - 50',
                  rows: [41,42,43,44,45,46,47,48,49,50].map(n => ({
                    header: '🎮',
                    title: `Número ${n}`,
                    description: `Adivinar el ${n}`,
                    id: `num_${n}_${userId}`
                  }))
                }
              ]
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