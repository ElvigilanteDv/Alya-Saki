import yts from "yt-search"
import fetch from "node-fetch"
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

let pendientes = {}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎬 YTVIDEO',
        sections: [
          {
            title: '🔗 ENLACE O BÚSQUEDA',
            rows: [
              {
                header: '📥 DESCARGA DIRECTA',
                title: '🎬 PEGAR LINK O NOMBRE',
                description: 'Ejemplo: https://youtu.be/... o El vigilante',
                id: `${usedPrefix}ytvideo `
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: { title: 'Saki - ѕυв', subtitle: 'Youtube a Video', hasMediaAttachment: false },
      body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *COMANDO ::* ${usedPrefix + command}
𑁍𓂃 𓈒𓏸 *USO ::* Envía un enlace de YouTube o una búsqueda

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
    return
  }

  await m.react("🎬")

  try {
    let url = text.trim()
    let title = "Desconocido"
    let authorName = "Desconocido"
    let durationTimestamp = "Desconocida"
    let views = 0
    let thumbnail = ""

    const isUrl = /^https?:\/\/\S+/i.test(url)

    if (isUrl) {
      if (!isYouTubeUrl(url)) {
        return m.reply("🚫 El enlace no es válido de YouTube.")
      }

      const videoId = extractVideoId(url)
      if (!videoId) {
        return m.reply("🚫 No pude extraer el ID del video.")
      }

      const res = await yts({ videoId })

      if (!res) {
        return m.reply("🚫 No pude obtener información del video.")
      }

      title = res.title || title
      authorName = res.author?.name || authorName
      durationTimestamp = res.timestamp || durationTimestamp
      views = res.views || views
      thumbnail = res.thumbnail || thumbnail
      url = res.url || url
    } else {
      const res = await yts(url)

      if (!res?.videos?.length) {
        return m.reply("🚫 No encontré nada.")
      }

      const video = res.videos[0]
      title = video.title || title
      authorName = video.author?.name || authorName
      durationTimestamp = video.timestamp || durationTimestamp
      views = video.views || views
      url = video.url || url
      thumbnail = video.thumbnail || thumbnail
    }

    const vistas = formatViews(views)
    const chatId = m.chat

    pendientes[chatId] = {
      url: url,
      title: title
    }

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
        media = await prepareWAMessageMedia({ image: fs.readFileSync(thumbPath) }, { upload: conn.waUploadToServer })
        fs.unlinkSync(thumbPath)
      }
    }

    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎬 DESCARGAR',
        sections: [
          {
            title: '✅ VIDEO ENCONTRADO',
            rows: [
              {
                header: '📥 TOCA PARA DESCARGAR',
                title: title.substring(0, 35),
                description: `⏱️ ${durationTimestamp} | 👁️ ${vistas}`,
                id: `video_download_${chatId}`
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'Saki - ѕυв',
        subtitle: 'Youtube a Video',
        hasMediaAttachment: !!media,
        imageMessage: media ? media.imageMessage : undefined
      },
      body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO ::* ${title}
𑁍𓂃 𓈒𓏸 *CANAL ::* ${authorName}
𑁍𓂃 𓈒𓏸 *DURACIÓN ::* ${durationTimestamp}
𑁍𓂃 𓈒𓏸 *VISTAS ::* ${vistas}

> *Toca el botón para descargar*

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

  } catch (e) {
    console.error(e)
    await m.reply("❌ Error: " + e.message)
    await m.react("⚠️")
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    if (id && id.startsWith('video_download_')) {
      const chatId = id.replace('video_download_', '')
      const pendiente = pendientes[chatId]

      if (!pendiente) {
        await conn.sendMessage(m.chat, { text: `❌ El enlace expiró. Usa *ytvideo* nuevamente.` }, { quoted: m })
        return true
      }

      await m.react('⏳')
      await conn.sendMessage(m.chat, { text: `⏳ *Descargando ${pendiente.title}...*` }, { quoted: m })

      const apiUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/ytvideo?url=${encodeURIComponent(pendiente.url)}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!data.status || !data.result?.download_url) {
        throw new Error('No se pudo obtener el video')
      }

      const { title, download_url } = data.result

      const tmpDir = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

      const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`)
      const outputPath = path.join(tmpDir, `output_${Date.now()}.mp4`)

      const videoRes = await fetch(download_url)
      const videoBuffer = await videoRes.buffer()
      fs.writeFileSync(inputPath, videoBuffer)

      await conn.sendMessage(m.chat, { text: `🔄 *Convirtiendo video con ffmpeg...*` }, { quoted: m })

      await execPromise(`ffmpeg -i "${inputPath}" -c:v libx264 -c:a aac -movflags +faststart "${outputPath}"`)

      const convertedBuffer = fs.readFileSync(outputPath)

      await conn.sendMessage(m.chat, {
        video: convertedBuffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `✅ Video descargado\n\n🎬 Título: ${title}`
      }, { quoted: m })

      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)
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

const formatViews = (views) => {
  const n = Number(views)
  if (!n || Number.isNaN(n)) return "No disponible"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

const extractVideoId = (url) => {
  const match =
    url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|\b)/) ||
    url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/)
  return match?.[1] || null
}

handler.command = ["ytvideo", "yt2", "play2"]
handler.tags = ["downloader"]
handler.help = ['ytvideo']
handler.register = false

export default handler