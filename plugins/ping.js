let handler = async (m, { conn }) => {
  let inicio = Date.now()
  await conn.sendMessage(m.chat, { text: '🏓 Calculando velocidad...' }, { quoted: m })
  let fin = Date.now()
  let ping = fin - inicio
  
  await m.reply(`
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *VELOCIDAD ::* ${ping}ms
𑁍𓂃 𓈒𓏸 *ESTADO ::* ${ping < 100 ? '🟢 EXCELENTE' : ping < 200 ? '🟡 NORMAL' : '🔴 LENTO'}
𑁍𓂃 𓈒𓏸 *USUARIO ::* ${m.pushName}

> *Saki desarrollado por Edward* ૮(˶ᵔᵕᵔ˶)ა

https://dvlyonnxz.onrender.com
`.trim())
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p']

export default handler
