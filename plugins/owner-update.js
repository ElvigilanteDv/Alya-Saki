import { execSync } from 'child_process'

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* Solo el creador puede usar este comando
𑁍𓂃 𓈒𓏸 *TIPO ::* σωηєя`, m)
  }

  const imagenURL = 'https://files.catbox.moe/22vhqk.jpeg'
  const nombre = m.pushName || m.sender.split('@')[0]

  try {
    await conn.reply(m.chat, `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ESTADO ::* ⏳ Actualizando...
𑁍𓂃 𓈒𓏸 *SOLICITADO POR ::* @${m.sender.split('@')[0]}

> Por favor espera ⸜(｡˃ ᵕ ˂ )⸝♡`, m, { mentions: [m.sender] })

    const output = execSync('git pull' + (args.length ? ' ' + args.join(' ') : '')).toString()
    const isUpdated = output.includes('Already up to date')

    await conn.sendMessage(m.chat, {
      image: { url: imagenURL },
      caption: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ESTADO ::* ${isUpdated ? '✅ Ya estaba actualizado' : '✅ Actualización aplicada'}
𑁍𓂃 𓈒𓏸 *ACTUALIZADO POR ::* @${m.sender.split('@')[0]}
𑁍𓂃 𓈒𓏸 *HORA ::* ${new Date().toLocaleString()}${!isUpdated ? `\n\n𑁍𓂃 𓈒𓏸 *CAMBIOS ::*\n${output.slice(0, 300)}` : ''}`,
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    let conflictMsg = '❌ Error al actualizar'

    try {
      const status = execSync('git status --porcelain').toString().trim()

      if (status) {
        const conflictedFiles = status
          .split('\n')
          .map(line => line.slice(3))
          .filter(file =>
            !file.startsWith('.npm/') &&
            !file.startsWith('Sessions/Principal/') &&
            !file.startsWith('node_modules/') &&
            !file.startsWith('package-lock.json') &&
            !file.startsWith('database.json') &&
            !file.startsWith('.cache/') &&
            !file.startsWith('tmp/')
          )

        if (conflictedFiles.length > 0) {
          conflictMsg = `⚠️ Conflictos detectados:\n\n${conflictedFiles.map(f => `𑁍𓂃 𓈒𓏸 ${f}`).join('\n')}\n\n> Resuelve manualmente o reinstala`
        }
      }
    } catch (statusError) {
      console.error(statusError)
    }

    await conn.sendMessage(m.chat, {
      image: { url: imagenURL },
      caption: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ESTADO ::* ❌ Error al actualizar
𑁍𓂃 𓈒𓏸 *SOLICITADO POR ::* @${m.sender.split('@')[0]}
𑁍𓂃 𓈒𓏸 *HORA ::* ${new Date().toLocaleString()}
𑁍𓂃 𓈒𓏸 *DETALLE ::* ${conflictMsg}`,
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('❌')
  }
}

const keywords = ['update', 'up', 'fix', 'actualizar']

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'up', 'fix', 'actualizar']
handler.owner = true

handler.all = async function (m) {
  if (!m.text || typeof m.text !== 'string') return
  const input = m.text.trim().toLowerCase()
  for (const keyword of keywords) {
    if (input === keyword) {
      return handler(m, { conn: this, args: [], isOwner: true })
    }
  }
}

export default handler