let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR* 
𑁍𓂃 𓈒𓏸 Este comando solo funciona en grupos

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())

  let who
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender
  } else if (text) {
    who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *USO* 
𑁍𓂃 𓈒𓏸 ${usedPrefix + command} @usuario

📌 *EJEMPLO:*
${usedPrefix + command} @${m.sender.split('@')[0]}

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
  }

  let owner = global.owner || []
  let isOwner = false
  for (let v of owner) {
    if (v[0] === who.split('@')[0] || v[0] === who || v[0].replace(/[^0-9]/g, '') === who.split('@')[0]) {
      isOwner = true
      break
    }
  }
  
  if (isOwner) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR* 
𑁍𓂃 𓈒𓏸 No puedo modificar al creador del bot

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())

  let groupMetadata = await conn.groupMetadata(m.chat)
  let participant = groupMetadata.participants.find(v => v.id === who)
  if (!participant) return m.reply(`❌ El usuario no está en el grupo.`)
  
  let isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
  let botParticipant = groupMetadata.participants.find(v => v.id === conn.user.jid)
  let botAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin'

  if (command === 'promote') {
    if (isAdmin) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *INFO* 
𑁍𓂃 𓈒𓏸 El usuario ya es administrador

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
    if (!botAdmin) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR* 
𑁍𓂃 𓈒𓏸 El bot no es administrador del grupo

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *PROMOVIDO* 
𑁍𓂃 𓈒𓏸 @${who.split('@')[0]} ha sido promovido a administrador

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim(), null, { mentions: [who] })
  }

  if (command === 'demote') {
    if (!isAdmin) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *INFO* 
𑁍𓂃 𓈒𓏸 El usuario no es administrador

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
    if (!botAdmin) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR* 
𑁍𓂃 𓈒𓏸 El bot no es administrador del grupo

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim())
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *DEGRADADO* 
𑁍𓂃 𓈒𓏸 @${who.split('@')[0]} ha sido degradado de administrador

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
`.trim(), null, { mentions: [who] })
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = ['promote', 'demote']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler