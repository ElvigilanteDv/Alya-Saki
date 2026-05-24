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
    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎵 TIKTOK',
        sections: [
          {
            title: '🔗 ENLACE O BÚSQUEDA',
            rows: [
              {
                header: '📥 DESCARGA DIRECTA',
                title: '🎬 PEGAR LINK O NOMBRE',
                description: 'Ejemplo: https://vm.tiktok.com/... o Goku',
                id: `${usedPrefix}tiktok `
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: { title: 'Saki - ѕυв', subtitle: 'TikTok Downloader', hasMediaAttachment: false },
      body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *COMANDO ::* ${usedPrefix + command}
𑁍𓂃 𓈒𓏸 *USO ::* Envía un enlace de TikTok o una búsqueda

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

  await m.react('🎵')

  let query = text.trim()
  let isDirectLink = query.includes('tiktok.com') || query.includes('vm.tiktok.com')

  try {
    // Si no es enlace directo, buscar en TikTok usando search/tiktok
    if (!isDirectLink) {
      const searchUrl = `https://api-de-el-vigilante-8jnf.onrender.com/search/tiktok?query=${encodeURIComponent(query)}`
      const searchRes = await fetch(searchUrl)
      const searchData = await searchRes.json()

      if (!searchData.status || !searchData.data?.length) {
        throw new Error('No se encontraron resultados')
      }

      const resultados = searchData.data.slice(0, 5)

      const rows = resultados.map((video, i) => ({
        header: `🎵 ${video.author?.nickname || 'Desconocido'}`,
        title: video.title?.substring(0, 35) || 'Sin título',
        description: `⏱️ ${video.duration || '?'} | 👁️ ${video.play_count || '?'}`,
        id: `tt_${i}_${Buffer.from(video.url).toString('base64')}_${Buffer.from(video.title || 'video').toString('base64')}`
      }))

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: { title: 'Saki - ѕυв', subtitle: 'Selecciona un video', hasMediaAttachment: false },
        body: { text: `🎵 *${query}*\n\nSe encontraron ${resultados.length} resultados. Selecciona uno:` },
        footer: { text: '⫏⫏ Saki - вσт ✿' },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎵 VER RESULTADOS',
              sections: [{
                title: '📋 SELECCIONA UN VIDEO',
                rows: rows
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
      return
    }

    // Si es enlace directo, procesar descarga inmediata usando download/tiktok
    await m.reply(`⏳ *Procesando video de TikTok...*`)

    const downloadUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/tiktok?url=${encodeURIComponent(query)}`
    const response = await fetch(downloadUrl)
    const data = await response.json()

    if (!data.status || !data.data?.video_url) {
      throw new Error('No se pudo obtener el video')
    }

    const { title, duration, video_url, cover_url } = data.data
    const minutos = Math.floor(duration / 60)
    const segundos = duration % 60
    const duracion = `${minutos}:${segundos.toString().padStart(2, '0')}`

    const chatId = m.chat
    pendientes[chatId] = {
      url: video_url,
      title: title || 'TikTok Video'
    }

    setTimeout(() => {
      if (pendientes[chatId]) delete pendientes[chatId]
    }, 60000)

    let media = null
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    if (cover_url) {
      const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.jpg`)
      const thumbRes = await fetch(cover_url)
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
                title: (title || 'TikTok Video').substring(0, 35),
                description: `Duración: ${duracion}`,
                id: `tt_download_${chatId}`
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'Saki - ѕυв',
        subtitle: 'TikTok Downloader',
        hasMediaAttachment: !!media,
        imageMessage: media ? media.imageMessage : undefined
      },
      body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO ::* ${title || 'TikTok Video'}
𑁍𓂃 𓈒𓏸 *DURACIÓN ::* ${duracion}

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

  } catch (error) {
    console.error(error)
    m.reply(`❌ Error: ${error.message}`)
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    // Manejar selección de búsqueda
    if (id && id.startsWith('tt_') && !id.includes('download')) {
      const parts = id.split('_')
      const urlBase64 = parts[2]
      const titleBase64 = parts[3]
      const videoUrl = Buffer.from(urlBase64, 'base64').toString()
      const videoTitle = Buffer.from(titleBase64, 'base64').toString()

      await m.react('⏳')
      await conn.sendMessage(m.chat, { text: `⏳ *Obteniendo video: ${videoTitle.substring(0, 40)}...*` }, { quoted: m })

      const downloadUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/tiktok?url=${encodeURIComponent(videoUrl)}`
      const response = await fetch(downloadUrl)
      const data = await response.json()

      if (!data.status || !data.data?.video_url) {
        throw new Error('No se pudo obtener el video')
      }

      const { title, duration, video_url, cover_url } = data.data
      const minutos = Math.floor(duration / 60)
      const segundos = duration % 60
      const duracion = `${minutos}:${segundos.toString().padStart(2, '0')}`

      const chatId = m.chat
      pendientes[chatId] = {
        url: video_url,
        title: title || videoTitle
      }

      setTimeout(() => {
        if (pendientes[chatId]) delete pendientes[chatId]
      }, 60000)

      let media = null
      const tmpDir = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

      if (cover_url) {
        const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.jpg`)
        const thumbRes = await fetch(cover_url)
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
                  title: (title || videoTitle).substring(0, 35),
                  description: `Duración: ${duracion}`,
                  id: `tt_download_${chatId}`
                }
              ]
            }
          ]
        })
      }

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: 'Saki - ѕυв',
          subtitle: 'TikTok Downloader',
          hasMediaAttachment: !!media,
          imageMessage: media ? media.imageMessage : undefined
        },
        body: { text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TÍTULO ::* ${title || videoTitle}
𑁍𓂃 𓈒𓏸 *DURACIÓN ::* ${duracion}

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
      return true
    }

    // Manejar descarga directa
    if (id && id.startsWith('tt_download_')) {
      const chatId = id.replace('tt_download_', '')
      const pendiente = pendientes[chatId]

      if (!pendiente) {
        await conn.sendMessage(m.chat, { text: `❌ El enlace expiró. Usa *tiktok* nuevamente.` }, { quoted: m })
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
        video: fs.readFileSync(videoPath),
        mimetype: 'video/mp4',
        fileName: `${pendiente.title}.mp4`,
        caption: `✅ Video descargado\n\n🎬 Título: ${pendiente.title}`
      }, { quoted: m })

      fs.unlinkSync(videoPath)
      delete pendientes[chatId]
      await m.react('✅')
      return true
    }

    return false

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `❌ Error al procesar: ${e.message}` }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help = ['tiktok', 'tt']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt']

export default handler