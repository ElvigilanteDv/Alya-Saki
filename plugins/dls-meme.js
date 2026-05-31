import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
  await m.react('😂')

  try {
    const apiUrl = 'https://api-de-el-vigilante-8jnf.onrender.com/random/meme'
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.status || !data.imagen) {
      throw new Error('No se pudo obtener el meme')
    }

    const { titulo, imagen, fuente, descargar } = data

    // Descargar la imagen del meme
    const imgRes = await fetch(imagen)
    const imgBuffer = await imgRes.buffer()

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const imgPath = path.join(tmpDir, `meme_${Date.now()}.jpg`)
    fs.writeFileSync(imgPath, imgBuffer)

    const media = await prepareWAMessageMedia(
      { image: fs.readFileSync(imgPath) },
      { upload: conn.waUploadToServer }
    )

    fs.unlinkSync(imgPath)

    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '😂 MEME',
        sections: [
          {
            title: '📋 OPCIONES',
            rows: [
              {
                header: '📥 DESCARGA DIRECTA',
                title: '⬇️ DESCARGAR MEME',
                description: 'Toca para descargar la imagen',
                id: `${usedPrefix}descargarmeme ${descargar}`
              },
              {
                header: '🔄 OTRO MEME',
                title: '🎲 MEME ALEATORIO',
                description: 'Generar otro meme',
                id: `${usedPrefix}${command}`
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - MEME',
        subtitle: 'Meme Aleatorio',
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO* : ${titulo || 'Sin título'}
𑁍𓂃 𓈒𓏸 *FUENTE* : ${fuente || 'Memedroid'}
𑁍𓂃 𓈒𓏸 *IDIOMA* : ${data.idioma || 'Español'}

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: { buttons: [buttons] }
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
    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m })
  }
}

handler.help = ['meme']
handler.tags = ['downloader']
handler.command = ['meme', 'memes']

export default handler