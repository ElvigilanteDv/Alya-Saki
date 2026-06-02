const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.sendMessage(m.chat, { text: '❌ Uso: #spam <número>|<mensaje>' }, { quoted: m })
  
  let texto = args.join(' ')
  let separador = texto.split('|')
  if (separador.length < 2) return conn.sendMessage(m.chat, { text: '❌ Uso: #spam <número>|<mensaje>' }, { quoted: m })
  
  let number = separador[0].trim()
  let message = separador[1].trim()

  try {
    for (let i = 0; i < 100; i++) {
      await conn.sendMessage(number + '@s.whatsapp.net', { text: message })
    }
    await m.react('✅')
    await conn.sendMessage(m.chat, { text: '✅ Spam completado a: *' + number + '*' }, { quoted: m })
  } catch (e) {
    await conn.sendMessage(m.chat, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

handler.help = ['spam']
handler.tags = ['owner']
handler.command = /^(spam)$/i
handler.owner = true

export default handler