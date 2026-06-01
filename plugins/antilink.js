let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR* 
𑁍𓂃 𓈒𓏸 Este comando solo funciona en grupos

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  if (text === 'on' || text === '1' || text === 'activar') {
    chat.antiLink = true
    m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ANTILINK* 
𑁍𓂃 𓈒𓏸 *ESTADO ::* ACTIVADO

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
  } else if (text === 'off' || text === '0' || text === 'desactivar') {
    chat.antiLink = false
    m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ANTILINK* 
𑁍𓂃 𓈒𓏸 *ESTADO ::* DESACTIVADO

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
  } else {
    m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *USO* 
𑁍𓂃 𓈒𓏸 ${usedPrefix + command} on
𑁍𓂃 𓈒𓏸 ${usedPrefix + command} off

📌 *EJEMPLO:*
${usedPrefix + command} on

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
