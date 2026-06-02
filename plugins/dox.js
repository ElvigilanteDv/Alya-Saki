// Comando: .dox <ip>
// Tags: info
// Descripción: Obtiene información de una dirección IP

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Uso correcto:* ${usedPrefix + command} <ip>\nEjemplo: ${usedPrefix + command} 8.8.8.8`)
  
  const ip = text.trim()
  
  // Verificar formato básico de IP
  if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
    return m.reply('❌ *IP inválida.* Formato correcto: 192.168.1.1')
  }
  
  try {
    await m.react('🕵️')
    
    // API pública sin API key (ipapi.co)
    const url = `https://ipapi.co/${ip}/json/`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    
    const data = await response.json()
    
    // Formatear respuesta
    let result = `
🔍 *DOXEO DE IP:* ${ip}

📌 *INFORMACIÓN BÁSICA:*
• 🌍 *País:* ${data.country_name || 'Desconocido'} (${data.country_code || 'N/A'})
• 🏙️ *Ciudad:* ${data.city || 'Desconocida'}
• 📡 *Proveedor:* ${data.org || data.asn || 'Desconocido'}
• 🗺️ *Coordenadas:* ${data.latitude || 'N/A'}, ${data.longitude || 'N/A'}
• 🕒 *Zona horaria:* ${data.timezone || 'N/A'}

📊 *TÉCNICO:*
• 🔢 *IP:* ${data.ip || ip}
• 🛡️ *Versión IP:* ${data.version || 'IPv4'}
• 📍 *Código postal:* ${data.postal || 'N/A'}
• 📞 *Código de área:* ${data.country_calling_code || 'N/A'}
• 💰 *Moneda:* ${data.currency || 'N/A'}

⚠️ *NOTA:* Esta información es pública y obtenida de fuentes abiertas.
`
    
    // Si hay coordenadas, agregar enlace de Google Maps
    if (data.latitude && data.longitude) {
      result += `\n🗺️ *Google Maps:* https://www.google.com/maps?q=${data.latitude},${data.longitude}`
    }
    
    // Enviar resultado
    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReply: {
          title: '🔎 DOX Tool - IP Lookup',
          body: 'Información obtenida exitosamente',
          thumbnail: await (await fetch('https://files.catbox.moe/22vhqk.jpeg')).buffer(),
          sourceUrl: 'https://ipapi.co'
        }
      }
    }, { quoted: m })
    
    await m.react('✅')
    
  } catch (error) {
    console.error(error)
    await m.reply(`❌ *Error al obtener información:* ${error.message}\n\n💡 *Posibles soluciones:*\n• Verifica que la IP sea pública\n• Intenta con otra API alternativa`)
    await m.react('❌')
  }
}

handler.help = ['dox <ip>']
handler.tags = ['info']
handler.command = ['dox', 'ipinfo', 'lookup']
handler.desc = 'Obtiene información pública de una dirección IP'
handler.register = false

export default handler
