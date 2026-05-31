import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let pendientes = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - VIDEO',
        subtitle: 'Youtube a Mp4',
        hasMediaAttachment: false
      },
      body: {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *COMANDO ::* ${usedPrefix + command}
𑁍𓂃 𓈒𓏸 *USO ::* Envía un enlace de YouTube o una búsqueda

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎬 YTVIDEO',
            sections: [{
              title: '🔗 ENLACE O BÚSQUEDA',
              rows: [{
                header: '📥 DESCARGA DIRECTA',
                title: '🎬 PEGAR LINK O NOMBRE',
                description: 'Ejemplo: https://youtu.be/... o Paulo Londra',
                id: `video `
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
    return
  }

  await m.react('🎬')

  let query = text.trim()
  let isDirectLink = query.includes('youtu.be') || query.includes('youtube.com')

  try {
    if (!isDirectLink) {
      const searchUrl = `https://api-de-el-vigilante-8jnf.onrender.com/search/youtube?q=${encodeURIComponent(query)}`
      const searchRes = await fetch(searchUrl)
      const searchData = await searchRes.json()

      if (!searchData.status || !searchData.result?.length) {
        throw new Error('No se encontraron resultados')
      }

      const resultados = searchData.result.slice(0, 5)

      const rows = resultados.map((video, i) => ({
        header: `🎬 ${video.channel || 'Desconocido'}`,
        title: video.title.substring(0, 35),
        description: `⏱️ ${video.duration || '?'} | 👁️ ${video.views || '?'}`,
        id: `video_${i}_${Buffer.from(video.url).toString('base64')}_${Buffer.from(video.title).toString('base64')}`
      }))

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'YO OFC - VIDEO',
          subtitle: 'Selecciona un video',
          hasMediaAttachment: false
        },
        body: {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *BÚSQUEDA ::* ${query}
𑁍𓂃 𓈒𓏸 *RESULTADOS ::* ${resultados.length}

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`
        },
        footer: {
          text: '⫏⫏ YO OFC - вσт ✿'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎬 VER RESULTADOS',
              sections: [{
                title: '📋 SELECCIONA UN VIDEO',
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
      return
    }

    await conn.sendMessage(m.chat, { text: '⏳ *Procesando video...*' }, { quoted: m })

    const downloadUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/ytvideo?url=${encodeURIComponent(query)}`
    const response = await fetch(downloadUrl)
    const data = await response.json()

    if (!data.status || !data.result?.download_url) {
      throw new Error('No se pudo obtener el video')
    }

    const { title, duration, thumbnail, download_url } = data.result
    const minutos = Math.floor(duration / 60)
    const segundos = duration % 60
    const duracion = `${minutos}:${segundos.toString().padStart(2, '0')}`

    const chatId = m.chat
    pendientes[chatId] = { url: download_url, title }

    setTimeout(() => {
      if (pendientes[chatId]) delete pendientes[chatId]
    }, 60000)

    let media = null
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    if (thumbnail) {
      const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.jpg`)
      const thumbRes = await fetch(thumbnail)
      if (thumbRes.ok) {
        const thumbBuffer = await thumbRes.buffer()
        fs.writeFileSync(thumbPath, thumbBuffer)
        media = await prepareWAMessageMedia(
          { image: fs.readFileSync(thumbPath) },
          { upload: conn.waUploadToServer }
        )
        fs.unlinkSync(thumbPath)
      }
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - VIDEO',
        subtitle: 'Youtube a Mp4',
        hasMediaAttachment: !!media,
        imageMessage: media ? media.imageMessage : undefined
      },
      body: {
        text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO ::* ${title}
𑁍𓂃 𓈒𓏸 *DURACIÓN ::* ${duracion}

> *Toca el botón para descargar*

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎬 DESCARGAR',
            sections: [{
              title: '✅ VIDEO ENCONTRADO',
              rows: [{
                header: '📥 TOCA PARA DESCARGAR',
                title: title.substring(0, 35),
                description: `Duración: ${duracion}`,
                id: `video_download_${chatId}`
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

  } catch (error) {
    console.error(error)
    await m.react('❌')
    m.reply(`❌ Error al procesar. Verifica que sea válido.`)
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    if (!id) return false

    if (id.startsWith('video_') && !id.startsWith('video_download_')) {
      const parts = id.split('_')
      const urlBase64 = parts[2]
      const titleBase64 = parts[3]
      const videoUrl = Buffer.from(urlBase64, 'base64').toString()
      const videoTitle = Buffer.from(titleBase64, 'base64').toString()

      await m.react('⏳')
      await conn.sendMessage(m.chat, { text: `⏳ *Obteniendo video: ${videoTitle.substring(0, 40)}...*` }, { quoted: m })

      const downloadUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/ytvideo?url=${encodeURIComponent(videoUrl)}`
      const response = await fetch(downloadUrl)
      const result = await response.json()

      if (!result.status || !result.result?.download_url) {
        throw new Error('No se pudo obtener el video')
      }

      const { title, duration, thumbnail, download_url } = result.result
      const minutos = Math.floor(duration / 60)
      const segundos = duration % 60
      const duracion = `${minutos}:${segundos.toString().padStart(2, '0')}`

      const chatId = m.chat
      pendientes[chatId] = { url: download_url, title }

      setTimeout(() => {
        if (pendientes[chatId]) delete pendientes[chatId]
      }, 60000)

      let media = null
      const tmpDir = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

      if (thumbnail) {
        const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.jpg`)
        const thumbRes = await fetch(thumbnail)
        if (thumbRes.ok) {
          const thumbBuffer = await thumbRes.buffer()
          fs.writeFileSync(thumbPath, thumbBuffer)
          media = await prepareWAMessageMedia(
            { image: fs.readFileSync(thumbPath) },
            { upload: conn.waUploadToServer }
          )
          fs.unlinkSync(thumbPath)
        }
      }

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'YO OFC - VIDEO',
          subtitle: 'Youtube a Mp4',
          hasMediaAttachment: !!media,
          imageMessage: media ? media.imageMessage : undefined
        },
        body: {
          text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO ::* ${title}
𑁍𓂃 𓈒𓏸 *DURACIÓN ::* ${duracion}

> *Toca el botón para descargar*

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`
        },
        footer: {
          text: '⫏⫏ YO OFC - вσт ✿'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎬 DESCARGAR',
              sections: [{
                title: '✅ VIDEO ENCONTRADO',
                rows: [{
                  header: '📥 TOCA PARA DESCARGAR',
                  title: title.substring(0, 35),
                  description: `Duración: ${duracion}`,
                  id: `video_download_${chatId}`
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
      return true
    }

    if (id.startsWith('video_download_')) {
      const chatId = id.replace('video_download_', '')
      const pendiente = pendientes[chatId]

      if (!pendiente) {
        await conn.sendMessage(m.chat, { text: `❌ El enlace expiró. Usa *video* nuevamente.` }, { quoted: m })
        return true
      }

      await m.react('⏳')
      await conn.sendMessage(m.chat, { text: `⏳ *Descargando ${pendiente.title}...*` }, { quoted: m })

      const tmpDir = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

      const videoPath = path.join(tmpDir, `${Date.now()}.mp4`)
      const videoRes = await fetch(pendiente.url)
      const videoBuffer = await videoRes.buffer()
      fs.writeFileSync(videoPath, videoBuffer)

      await conn.sendMessage(m.chat, {
        document: fs.readFileSync(videoPath),
        mimetype: 'video/mp4',
        fileName: `${pendiente.title}.mp4`
      }, { quoted: m })

      fs.unlinkSync(videoPath)
      delete pendientes[chatId]
      await m.react('✅')
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

handler.help = ['ytvideo']
handler.tags = ['downloader']
handler.command = ['video', 'mp4', 'ytvideo', 'ytmp4']

export default handler