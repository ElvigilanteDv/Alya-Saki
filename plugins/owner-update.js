import { execSync } from 'child_process'

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* Solo el creador puede usar este comando
𑁍𓂃 𓈒𓏸 *TIPO ::* Owner

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*`, m)
  }

  const imagenURL = 'https://files.catbox.moe/22vhqk.jpeg'

  try {
    await conn.reply(m.chat, `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ESTADO ::* Actualizando...
𑁍𓂃 𓈒𓏸 *TIEMPO ::* Por favor espera

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*`, m)

    const output = execSync('git pull' + (args.length ? ' ' + args.join(' ') : '')).toString()
    const isUpdated = output.includes('Already up to date')

    let texto = `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ESTADO ::* ${isUpdated ? '✅ Ya estaba actualizada' : '✅ Actualización aplicada'}
${isUpdated ? '' : '\n𑁍𓂃 𓈒𓏸 *CAMBIOS ::*\n' + output.slice(0, 300)}

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*`

    await conn.sendMessage(m.chat, {
      image: { url: imagenURL },
      caption: texto
    }, { quoted: m })

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
          conflictMsg = `⚠️ Conflictos en:\n\n${conflictedFiles.map(f => `> ₊· ${f}`).join('\n')}\n\n> Reinstala o resuelve manualmente`
        }
      }
    } catch (statusError) {
      console.error(statusError)
    }

    let textoError = `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* ${conflictMsg}

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*`

    await conn.sendMessage(m.chat, {
      image: { url: imagenURL },
      caption: textoError
    }, { quoted: m })
  }
}

const keywords = ['update', 'up', 'fix', 'actualizar']

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'up', 'fix', 'actualizar']
handler.desc = 'Actualizar Saki'
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