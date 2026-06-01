let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!m.isGroup) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* Solo funciona en grupos`.trim())

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  // Verificar que el bot sea admin
  let groupMetadata = await conn.groupMetadata(m.chat)
  let botParticipant = groupMetadata.participants.find(v => v.id === conn.user.jid)
  let isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'

  if (!isBotAdmin) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* El bot necesita ser administrador`.trim())

  if (text === 'on' || text === '1' || text === 'activar') {
    chat.antiLink = true
    await m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ANTILINK ::* ✅ ACTIVADO
𑁍𓂃 𓈒𓏸 *ACCIÓN ::* Los links serán eliminados y el usuario expulsado`.trim())
    await m.react('✅')

  } else if (text === 'off' || text === '0' || text === 'desactivar') {
    chat.antiLink = false
    await m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ANTILINK ::* ❌ DESACTIVADO
𑁍𓂃 𓈒𓏸 *ACCIÓN ::* Los links ya no serán bloqueados`.trim())
    await m.react('✅')

  } else {
    await m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ANTILINK ::* ${chat.antiLink ? '✅ Activado' : '❌ Desactivado'}
𑁍𓂃 𓈒𓏸 *USO ::* ${usedPrefix + command} on/off`.trim())
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true

// No ponemos handler.admin = true para que el owner pueda usarlo sin ser admin
handler.before = async (m, { conn, isOwner, isAdmin }) => {
  if (!m.isGroup) return false
  if (isOwner) return false // owner pasa siempre
  if (!isAdmin) {
    await m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* Solo administradores pueden usar esto`.trim())
    await m.react('❌')
    return true
  }
  return false
}

export default handler