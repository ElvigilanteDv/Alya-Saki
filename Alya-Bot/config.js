import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs'; 
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

global.botNumber = '';

global.owner = [
  ['59177474230', '👑 EL VIGILANTE', true],
  ['59177474230@s.whatsapp.net', 'EL VIGILANTE', true],
  ['59177474230@c.us', 'EL VIGILANTE', true],
  ['584241819270', '🤝 Lєσ', true],
  ['584241819270@s.whatsapp.net', 'Lєσ', true],
  ['584241819270@c.us', 'Lєσ', true]
];

global.mods = ['59177474230', '59177474230@s.whatsapp.net', '584241819270', '584241819270@s.whatsapp.net'];
global.suittag = ['59177474230', '584241819270'];
global.prems = ['59177474230', '59177474230@s.whatsapp.net', '584241819270', '584241819270@s.whatsapp.net'];

global.libreria = 'Baileys';
global.baileys = 'V 6.7.9';
global.languaje = 'Español';
global.vs = '2.2.0';
global.vsJB = '5.0';
global.nameqr = '𓆩⚝𓆪 YO OFC 𓍯 𓆩⚝𓆪';
global.sessions = 'YoOfcSesions';
global.jadi = 'YoOfcJadiBot';
global.blackJadibts = true;

global.packsticker = `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *STICKER* 
𑁍𓂃 𓈒𓏸 *CREADOR ::* EL VIGILANTE

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`;

global.packname = 'YO OFC - вσт';

global.author = `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *YO OFC - вσт*
𑁍𓂃 𓈒𓏸 *DEVELOPER ::* EL VIGILANTE

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`;

global.wm = 'YO OFC - вσт';
global.titulowm = 'YO OFC - вσт';
global.igfg = 'EL VIGILANTE';
global.botname = 'YO OFC - вσт';
global.dev = '> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა';
global.textbot = 'YO OFC - вσт : EL VIGILANTE';
global.gt = 'YO OFC - вσт';
global.namechannel = 'YO OFC - вσт / EL VIGILANTE';

global.monedas = 'мσηє∂αѕ';

global.gp1 = 'https://chat.whatsapp.com/IQQCPHdjqUU50t5FgShLdd';
global.gp2 = 'https://chat.whatsapp.com/IQQCPHdjqUU50t5FgShLdd';
global.comunidad1 = 'https://chat.whatsapp.com/IQQCPHdjqUU50t5FgShLdd';
global.channel = 'https://whatsapp.com/channel/0029VbCOTaJ9RZAQPdiZ4J1K';
global.cn = global.channel;
global.yt = 'https://youtube.com/@ElVigilanteDv';
global.md = 'https://github.com/ElvigilanteDv';
global.correo = 'elvigilante@yoofc.com';

global.catalogo = null;
try {
    const catalogoPath = new URL('../src/catalogo.jpg', import.meta.url);
    if (fs.existsSync(catalogoPath)) {
        global.catalogo = fs.readFileSync(catalogoPath);
    } else {
        console.log(chalk.yellow('⚠️ No se encontró catalogo.jpg'));
    }
} catch(e) {
    console.log(chalk.yellow('⚠️ Error cargando catalogo.jpg'));
}

global.photoSity = global.catalogo ? [global.catalogo] : [];

global.estilo = { 
  key: {  
    fromMe: false, 
    participant: '0@s.whatsapp.net', 
  }, 
  message: { 
    orderMessage: { 
      itemCount : -999999, 
      status: 1, 
      surface : 1, 
      message: global.packname, 
      orderTitle: 'YO OFC - вσт', 
      thumbnail: global.catalogo || Buffer.from(''), 
      sellerJid: '0@s.whatsapp.net'
    }
  }
};

global.ch = { ch1: "https://whatsapp.com/channel/0029VbCOTaJ9RZAQPdiZ4J1K" };
global.rcanal = global.ch.ch1;

global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;

global.multiplier = 69;
global.maxwarn = 3;

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.magenta('🔄 Sє α¢тυαℓízσ ∂є YO OFC - вσт ✿'));
});

console.log(chalk.green('✅ cσηfιg.נѕ ¢αrgα∂σ ¢σrrє¢тαмєηтє ✿'));