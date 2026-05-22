let handler = async (m, { conn }) => {
  const subBots = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== 3)
  const totalSubBots = subBots.length
  const fotoMenu = 'https://files.catbox.moe/vb9zu1.jpg'

  if (totalSubBots === 0) {
    return await conn.sendMessage(m.chat, {
      image: { url: fotoMenu },
      caption: `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *SUB-BOTS ::* 0
𑁍𓂃 𓈒𓏸 *ESTADO ::* No hay sub-bots activos

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
      `.trim()
    }, { quoted: m })
  }

  let listado = ''
  for (let i = 0; i < subBots.length; i++) {
    const bot = subBots[i]
    const nombre = bot.user.name || 'Sin nombre'
    const numero = bot.user.jid || 'Sin número'
    listado += `𑁍𓂃 𓈒𓏸 *${i + 1}.* ${nombre}\n`
    listado += `𑁍𓂃 𓈒𓏸 📱 ${numero}\n\n`
  }

  await conn.sendMessage(m.chat, {
    image: { url: fotoMenu },
    caption: `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *TOTAL SUB-BOTS ::* ${totalSubBots}
𑁍𓂃 𓈒𓏸 *ACTIVOS ::* ${totalSubBots}

${listado}

> *Saki desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა
> *Mano Derecha: Leo*
    `.trim()
  }, { quoted: m })
}

handler.help = ['bots']
handler.tags = ['serbot']
handler.command = ['bots', 'subbots', 'listbots']

export default handler