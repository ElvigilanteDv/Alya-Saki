import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const preguntas = require('../preguntas.json')

let partidas = {}

function getPreguntaRandom() {
  return preguntas[Math.floor(Math.random() * preguntas.length)]
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const userId = m.sender
  const pregunta = getPreguntaRandom()

  partidas[userId] = {
    correct: pregunta.correct,
    pregunta: pregunta.question
  }

  const rows = pregunta.options.map((op, i) => ({
    header: `${['🅰️','🅱️','🅾️','🆎'][i]}`,
    title: op,
    description: `Opción ${i + 1}`,
    id: `trivia_${Buffer.from(op).toString('base64')}_${userId}`
  }))

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: 'YO OFC - 🧠 TRIVIA',
      subtitle: 'Responde la pregunta',
      hasMediaAttachment: false
    },
    body: {
      text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *PREGUNTA ::* ${pregunta.question}

> Selecciona la respuesta correcta`
    },
    footer: {
      text: '⫏⫏ YO OFC - вσт ✿'
    },
    nativeFlowMessage: {
      buttons: [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '🧠 RESPONDER',
          sections: [{
            title: '📋 OPCIONES',
            rows
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
  await m.react('🧠')
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    if (!id) return false

    if (id.startsWith('trivia_')) {
      const parts = id.split('_')
      const respuesta = Buffer.from(parts[1], 'base64').toString()
      const userId = parts[2]
      const partida = partidas[userId]

      if (!partida) {
        await conn.sendMessage(m.chat, { text: `❌ No tienes una partida activa. Usa *!trivia* para iniciar.` }, { quoted: m })
        return true
      }

      const correcto = respuesta === partida.correct

      delete partidas[userId]

      const nuevaPregunta = getPreguntaRandom()
      partidas[userId] = {
        correct: nuevaPregunta.correct,
        pregunta: nuevaPregunta.question
      }

      const rows = nuevaPregunta.options.map((op, i) => ({
        header: `${['🅰️','🅱️','🅾️','🆎'][i]}`,
        title: op,
        description: `Opción ${i + 1}`,
        id: `trivia_${Buffer.from(op).toString('base64')}_${userId}`
      }))

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'YO OFC - 🧠 TRIVIA',
          subtitle: correcto ? '¡Correcto! 🎉' : '¡Incorrecto! ❌',
          hasMediaAttachment: false
        },
        body: {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *PREGUNTA ANTERIOR ::* ${partida.pregunta}
𑁍𓂃 𓈒𓏸 *TU RESPUESTA ::* ${respuesta}
𑁍𓂃 𓈒𓏸 *RESULTADO ::* ${correcto ? '✅ CORRECTO' : `❌ INCORRECTO — Era: *${partida.correct}*`}

─────────────────────

𑁍𓂃 𓈒𓏸 *NUEVA PREGUNTA ::* ${nuevaPregunta.question}

> Selecciona la respuesta correcta`
        },
        footer: {
          text: '⫏⫏ YO OFC - вσт ✿'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🧠 RESPONDER',
              sections: [{
                title: '📋 OPCIONES',
                rows
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
      await m.react(correcto ? '🎉' : '❌')
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

handler.help = ['trivia']
handler.tags = ['game']
handler.command = ['trivia', 'quiz']

export default handler