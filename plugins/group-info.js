import fs from 'fs'

const handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '`❌ Este comando solo puede usarse en grupos`' }, { quoted: m })
  
  try {
    let metadata = await conn.groupMetadata(m.chat)
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://files.catbox.moe/22vhqk.jpeg')
    
    let texto = `𑁍ࠬܓ ⁾ ㅤׄㅤׅㅤׄ INFO DEL GRUPO ㅤ֢ㅤׄㅤׅ\n\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Nombre:* ${metadata.subject}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *ID:* ${metadata.id}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Creador:* ${metadata.owner ? `@${metadata.owner.split('@')[0]}` : 'Desconocido'}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Creado:* ${new Date(metadata.creation * 1000).toLocaleString()}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Descripción:* ${metadata.desc || 'Sin descripción'}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Miembros:* ${metadata.participants.length}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Administradores:* ${metadata.participants.filter(p => p.admin).length}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Solo admins editan:* ${metadata.restrict ? 'Sí' : 'No'}\n`
    texto += `ׄㅤ𑁍ࠬܓε(´｡•᎑•`)っ ᜒ *Solo admins hablan:* ${metadata.announce ? 'Sí' : 'No'}\n\n`
    texto += `> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔ ᵕ ᵔ˶)ა`
    
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: texto,
      mentions: metadata.owner ? [metadata.owner] : []
    }, { quoted: m })
    
  } catch (e) {
    await conn.sendMessage(m.chat, { text: '❌ Error al obtener la información del grupo' }, { quoted: m })
  }
}

handler.help = ['infogrupo']
handler.tags = ['group']
handler.command = /^(infogrupo|groupinfo|gcinfo|grupoinfo)$/i
handler.group = true

export default handler