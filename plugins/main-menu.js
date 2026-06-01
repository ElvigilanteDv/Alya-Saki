import fs from 'fs'
import path, { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

const tags = {
  main: 'ρяιη¢ιραℓ',
  group: 'ɢяυρσѕ',
  economy: 'є¢σησму',
  game: 'gαмє',
  serbot: 'ѕєявσт',
  owner: 'σωηєя',
  downloader: '∂σωηℓσα∂єя',
  info: 'ιηƒσ'
}

const defaultMenu = {
  before: `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡ Soy 𓆩⚝𓆪 YO OFC 𓍯 𓆩⚝𓆪, un gusto conocerte. Estoy aquí para lo que necesites ♡

𑁍𓂃 𓈒𓏸 *DEVELOPER ::* EL VIGILANTE
𑁍𓂃 𓈒𓏸 *TIPO ::* Owner
𑁍𓂃 𓈒𓏸 *SISTEMA/OPR ::* android
𑁍𓂃 𓈒𓏸 *TIME ::* %time
𑁍𓂃 𓈒𓏸 *USERS ::* %totalreg
𑁍𓂃 𓈒𓏸 *CMDS EJEC ::* %totalcmd
𑁍𓂃 𓈒𓏸 *MI TIEMPO ::* %uptime

%readmore
`,
  header: '\n`𑁍ࠬܓ ⁾ ㅤׄㅤׅㅤׄ %category ㅤ֢ㅤׄㅤׅ`\n',
  body: 'ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ %cmd',
  footer: '',
  after: `

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let user = global.db.data.users[m.sender]

    if (!user) {
      user = { exp: 0, level: 0 }
      global.db.data.users[m.sender] = user
    }

    const { exp, level } = user
    const { min, xp } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        desc: p.desc || ''
      }))

    let bannerFinal = 'https://files.catbox.moe/22vhqk.jpeg'

    let textoMenu = defaultMenu.before
      .replace(/%time/g, new Date().toLocaleString())
      .replace(/%totalcmd/g, Object.keys(global.plugins).length)
      .replace(/%uptime/g, process.uptime().toFixed(0) + 's')

    for (let tag of Object.keys(tags)) {
      const cmds = help
        .filter(menu => menu.tags?.includes(tag))
        .map(menu => menu.help.map(h =>
          defaultMenu.body
            .replace(/%cmd/g, menu.prefix ? h : `${_p}${h}`)
            + (menu.desc ? ` - ${menu.desc}` : '')
        ).join('\n')).join('\n')

      if (cmds) {
        textoMenu += defaultMenu.header.replace(/%category/g, tags[tag])
        textoMenu += '\n' + cmds
        textoMenu += '\n' + defaultMenu.footer
      }
    }

    textoMenu += defaultMenu.after

    const replace = {
      name,
      level,
      exp: exp - min,
      maxexp: xp,
      totalreg: Object.keys(global.db.data.users).length,
      readmore: readMore
    }

    let texto = textoMenu

    for (let key of Object.keys(replace)) {
      texto = texto.replace(new RegExp(`%${key}`, 'g'), replace[key])
    }

    const media = await prepareWAMessageMedia(
      { image: { url: bannerFinal } },
      { upload: conn.waUploadToServer }
    )

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: 'YO OFC - вσт',
        subtitle: 'Menú Principal',
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: {
        text: texto.trim()
      },
      footer: {
        text: '⫏⫏ YO OFC - вσт ✿'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📡 COMANDOS',
            sections: [{
              title: '☄️ SISTEMA',
              rows: [{
                header: 'Estado',
                title: '📡 PING',
                description: 'Velocidad del bot',
                id: 'ping'
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
    await m.react('🕸️')

  } catch (e) {
    console.log(e)
    await conn.sendMessage(m.chat, { text: `❌ Error:\n${e}` }, { quoted: m })
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null

    if (!id) return false

    // Buscar el plugin que tenga ese comando igual que play busca audio_
    const plugin = Object.values(global.plugins).find(p => {
      if (p.disabled) return false
      const cmds = Array.isArray(p.command) ? p.command : [p.command]
      return cmds.includes(id)
    })

    if (!plugin) return false

    await m.react('⏳')

    m.text = ''
    m.body = id

    await plugin(m, {
      conn,
      text: '',
      usedPrefix: '!',
      command: id,
      args: [],
      v: m
    })

    await m.react('✅')
    return true

  } catch (e) {
    console.log('[MENU ERROR]', e)
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']
handler.register = false
handler.desc = 'Muestra el menú principal del bot'

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)