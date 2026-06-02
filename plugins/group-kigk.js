const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo puede usarse en grupos' }, { quoted: m })
  if (!isBotAdmin) return conn.sendMessage(m.chat, { text: '❌ El bot necesita ser administrador' }, { quoted: m })
  if (!isAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo administradores pueden usar este comando' }, { quoted: m })

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  if (!who) return conn.sendMessage(m.chat, { text: '❌ Menciona o responde al mensaje de quien quieres expulsar' }, { quoted: m })

  let metadata = await conn.groupMetadata(m.chat)
  let participants = metadata.participants
  let isOwner = participants.some(p => p.id === who && p.admin === 'superadmin')

  if (isOwner) {
    return conn.sendMessage(m.chat, { text: '𑁍ࠬܓ ⁾ ㅤׄㅤׅㅤׄ ANTI OWNER ㅤ֢ㅤׄㅤׅ\n\nׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ No se puede expulsar al creador del grupo' }, { quoted: m })
  }

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  await conn.sendMessage(m.chat, { text: '✅ Usuario expulsado' }, { quoted: m })
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = /^(kick|sacar|echar)$/i
handler.admin = true
handler.botAdmin = true

export default handler