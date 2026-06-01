let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *ERROR ::* Solo funciona en grupos`.trim())

  let groupMetadata = await conn.groupMetadata(m.chat)
  let participants = groupMetadata.participants
  let mentions = participants.map(p => p.id)

  let texto = participants.map(p => `@${p.id.split('@')[0]}`).join(' ')

  await conn.sendMessage(m.chat, {
    text: `> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TAGALL ::* Mencionando a todos
𑁍𓂃 𓈒𓏸 *MIEMBROS ::* ${participants.length}
${text ? `𑁍𓂃 𓈒𓏸 *MENSAJE ::* ${text}` : ''}

${texto}`,
    mentions
  }, { quoted: m })

  await m.react('✅')
}

handler.help = ['tagall']
handler.tags = ['group']
handler.command = ['tagall', 'everyone', 'all']
handler.group = true
handler.admin = true

export default handler