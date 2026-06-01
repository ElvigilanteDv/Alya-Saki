process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js'
import cluster from 'cluster'
const { setupMaster, fork } = cluster
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { alyaJadiBot } from '../plugins/serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import boxen from 'boxen'
import pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from '../lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from '../lib/mongoDB.js'
import store from '../lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
    return createRequire(dir)
}

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

global.timestamp = { start: new Date() }

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#/!.]')

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('./src/database/database.json'))

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this)
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
            }
        }, 1 * 1000))
    }
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {}),
    }
    global.db.chain = chain(global.db.data)
}
loadDatabase()

const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions)
const msgRetryCounterMap = (MessageRetryMap) => {}
const msgRetryCounterCache = new NodeCache()
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const theme = {
    banner: chalk.bgMagenta.black,
    accent: chalk.bold.magenta,
    highlight: chalk.bold.cyan,
    text: chalk.bold.white,
    prompt: chalk.bold.magenta
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion = null
let codeRequested = false

const credsExist = fs.existsSync(`./${global.sessions}/creds.json`)

if (!methodCodeQR && !methodCode && !credsExist) {
    console.log(theme.banner(`
╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🌸 *Saki - вσт* 🌸
┃ *ᴇʟ ᴀsɪsᴛᴇɴᴛᴇ ᴍás ᴄᴏᴍᴘʟᴇᴛᴏ*
╰━━━━━━━━━━━━━━━━━━━━╯
    `))
    do {
        opcion = await question(
            theme.accent('⌬ SELECCIONA MODO DE CONEXIÓN:\n') +
            theme.highlight('1. 📱 CÓDIGO QR\n') +
            theme.text('2. 🔐 CÓDIGO DE 8 DÍGITOS\n') +
            theme.prompt('🌸➤ ')
        )
        if (!/^[1-2]$/.test(opcion)) {
            console.log(chalk.bold.redBright(`✨ Opción inválida. Elige 1 o 2.`))
        }
    } while (opcion !== '1' && opcion !== '2')
} else if (methodCode) {
    opcion = '2'
} else if (methodCodeQR) {
    opcion = '1'
}

console.info = () => {}
console.debug = () => {}

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcion === '1' ? true : false,
    mobile: MethodMobile,
    browser: opcion === '1' ? [`${global.nameqr}`, 'Edge', '20.0.04'] : ['Chrome', 'Edge', '110.0.1587.56'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (clave) => {
        let jid = jidNormalizedUser(clave.remoteJid)
        let msg = await store.loadMessage(jid, clave.id)
        return msg?.message || ""
    },
    msgRetryCounterCache,
    msgRetryCounterMap,
    defaultQueryTimeoutMs: undefined,
    version,
}

global.conn = makeWASocket(connectionOptions)

// Manejar código de 8 dígitos solo una vez
if (opcion === '2' && !credsExist && !codeRequested) {
    codeRequested = true
    let addNumber = null
    
    if (!!phoneNumber && phoneNumber !== '') {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
        console.log(chalk.bold.cyan(`📌 Usando número configurado: ${addNumber}`))
    } else {
        let validNumber = false
        while (!validNumber) {
            const inputNumber = await question(chalk.bgMagenta.black(chalk.bold.white(`🌸 INGRESA TU NÚMERO CON CÓDIGO DE PAÍS SIN +:\n🌸➤ `)))
            const cleanNumber = inputNumber.replace(/\D/g, '')
            if (cleanNumber.length > 5) {
                addNumber = cleanNumber
                validNumber = true
            } else {
                console.log(chalk.bold.red('❌ Número inválido. Intenta de nuevo.'))
            }
        }
        rl.close()
    }
    
    console.log(chalk.bold.cyan(`📌 Solicitando código de 8 dígitos...`))
    
    setTimeout(async () => {
        try {
            let code = await global.conn.requestPairingCode(addNumber)
            code = code?.match(/.{1,4}/g)?.join("-") || code
            console.log(chalk.bold.white(chalk.bgMagenta(`🌸 CÓDIGO: ${code} 🌸`)))
            console.log(chalk.cyan(`📌 Ingresa este código en WhatsApp > Dispositivos vinculados > Vincular con código de 8 dígitos`))
        } catch (err) {
            console.log(chalk.bold.red(`❌ Error al obtener el código: ${err.message}`))
        }
    }, 3000)
}

conn.isInit = false
conn.well = false
conn.logger.info(` 🌸 Saki - вσт ɪɴɪᴄɪᴀᴅᴀ ᴄᴏʀʀᴇᴄᴛᴀᴍᴇɴᴛᴇ 🌸\n`)

if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write()
        if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', `${jadi}`], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])))
    }, 30 * 1000)
}

async function getGroupPicture(groupJid) {
    try {
        return await global.conn.profilePictureUrl(groupJid, 'image')
    } catch (e) {
        return 'https://files.catbox.moe/vb9zu1.jpg'
    }
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
    global.stopped = connection

    if (isNewLogin) conn.isInit = true
    if (!global.db.data) loadDatabase()

    if (qr && qr !== '0' && opcion === '1') {
        console.log(chalk.bold.magenta(`\n❐ ESCANEA EL CÓDIGO QR - EXPIRA EN 45 SEGUNDOS`))
    }

    if (connection === 'open') {
        console.log(chalk.bold.magenta('\n🌸 Saki - вσт ᴄᴏɴᴇᴄᴛᴀᴅᴀ 🌸'))
        const bio = `🌸 Saki - вσт | EL VIGILANTE`
        await global.conn.updateProfileStatus(bio).catch(() => {})
    }

    if (connection === 'close') {
        switch (reason) {
            case DisconnectReason.badSession:
            case DisconnectReason.loggedOut:
                console.log(chalk.bold.redBright(`\n⚠︎ SESIÓN INVÁLIDA, BORRA LA CARPETA ${global.sessions} Y REINICIA ⚠︎`))
                break
            case DisconnectReason.connectionClosed:
                console.log(chalk.bold.magentaBright(`\n⚠︎ CONEXIÓN CERRADA, RECONECTANDO...`))
                break
            case DisconnectReason.connectionLost:
                console.log(chalk.bold.magentaBright(`\n⚠︎ CONEXIÓN PERDIDA, RECONECTANDO...`))
                break
            case DisconnectReason.connectionReplaced:
                console.log(chalk.bold.yellowBright(`\n⚠︎ CONEXIÓN REEMPLAZADA, OTRA SESIÓN INICIADA`))
                return
            case DisconnectReason.restartRequired:
                console.log(chalk.bold.cyanBright(`\n☑ REINICIANDO SESIÓN...`))
                break
            case DisconnectReason.timedOut:
                console.log(chalk.bold.yellowBright(`\n⚠︎ TIEMPO AGOTADO, REINTENTANDO...`))
                break
            default:
                console.log(chalk.bold.redBright(`\n⚠︎ DESCONEXIÓN DESCONOCIDA (${reason || 'Desconocido'})`))
                break
        }

        if (conn?.ws?.socket === null) {
            await global.reloadHandler(true).catch(console.error)
            global.timestamp.connect = new Date()
        }
    }
}

// Variable para evitar duplicados
let lastWelcomeEvent = {}

global.conn.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update

        const eventKey = `${id}_${action}_${participants.sort().join(',')}`
        const now = Date.now()

        if (lastWelcomeEvent[eventKey] && (now - lastWelcomeEvent[eventKey] < 2000)) {
            console.log('Evento duplicado ignorado')
            return
        }
        lastWelcomeEvent[eventKey] = now

        if (!global.db.data) await loadDatabase()
        if (!global.db.data.chats[id]) global.db.data.chats[id] = {}
        const chat = global.db.data.chats[id]
        const welcomeEnabled = chat.welcome !== false
        if (!welcomeEnabled) return

        const groupMetadata = await global.conn.groupMetadata(id).catch(() => null)
        if (!groupMetadata) return
        const groupName = groupMetadata.subject || 'ᴇʟ ɢʀᴜᴘᴏ'
        const memberCount = groupMetadata.participants.length
        let groupIcon = await getGroupPicture(id)

        if (action === 'add') {
            const jids = participants
            const nombres = []

            for (const jid of jids) {
                if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
                nombres.push(`@${jid.split('@')[0]}`)
            }

            let welcomeText = chat.welcomeMessage || `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *BIENVENID@ AL GRUPO*
𑁍𓂃 𓈒𓏸 *USUARIO ::* ${nombres.join(', ')}
𑁍𓂃 𓈒𓏸 *MIEMBROS ::* ${memberCount}
𑁍𓂃 𓈒𓏸 *GRUPO ::* ${groupName}

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`

await global.conn.sendMessage(id, {
    image: { url: groupIcon },
    caption: welcomeText,
    mentions: jids
})

for (const jid of jids) {
    const userData = global.db.data.users[jid]
    if (chat.welcomeBonus !== false) {
        userData.monedas = (userData.monedas || 0) + 50
        userData.exp = (userData.exp || 0) + 100
    }
}

if (action === 'remove') {
    const jids = participants
    const nombres = []

    for (const jid of jids) {
        nombres.push(`@${jid.split('@')[0]}`)
    }

    const goodbyeText = `
> ¡Hola, buenas tardes! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *HASTA PRONTO*
𑁍𓂃 𓈒𓏸 *USUARIO ::* ${nombres.join(', ')}
𑁍𓂃 𓈒𓏸 *MIEMBROS RESTANTES ::* ${memberCount}

> *YO OFC desarrollado por EL VIGILANTE* ૮(˶ᵔᵕᵔ˶)ა`

    await global.conn.sendMessage(id, {
        image: { url: groupIcon },
        caption: goodbyeText,
        mentions: jids
    })
}

for (const key in lastWelcomeEvent) {
    if (Date.now() - lastWelcomeEvent[key] > 5000) {
        delete lastWelcomeEvent[key]
    }
}

} catch (e) { console.error('Error en group-participants:', e) }
})

process.on('uncaughtException', (err) => {
    if (err.code === 'ENAMETOOLONG') {
        console.error(chalk.red.bold(`✘ ERROR (ENAMETOOLONG): ${err.message}`))
    } else {
        console.error(chalk.red.bold('✘ ERROR CRÍTICO:'), err)
    }
})

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red.bold('✘ RECHAZO NO MANEJADO:'), reason)
})

let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
        if (Handler && (Handler.handler || Handler.default)) {
            handler = Handler.default || Handler
        }
    } catch (e) {
        console.error(e)
    }
    if (restatConn) {
        const oldChats = global.conn.chats
        try {
            global.conn.ws.close()
        } catch { }
        conn.ev.removeAllListeners()
        global.conn = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler)
        conn.ev.off('connection.update', conn.connectionUpdate)
        conn.ev.off('creds.update', conn.credsUpdate)
    }

    conn.handler = (handler.handler || handler).bind(global.conn)
    conn.connectionUpdate = connectionUpdate.bind(global.conn)
    conn.credsUpdate = saveCreds.bind(global.conn, true)

    conn.ev.on('messages.upsert', async (m) => {
        if (m.messages && m.messages[0] && m.messages[0].key && m.messages[0].key.remoteJid) {
            const jid = m.messages[0].key.remoteJid
            await conn.sendPresenceUpdate('composing', jid)
            await conn.handler(m)
            await conn.readMessages([m.messages[0].key])
            await conn.sendPresenceUpdate('paused', jid)
        }
    })

    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', conn.credsUpdate)

    isInit = false
    return true
}

global.rutaJadiBot = join(__dirname, '../subBot')

if (global.blackJadibts) {
    if (!existsSync(global.rutaJadiBot)) {
        mkdirSync(global.rutaJadiBot, { recursive: true })
        console.log(chalk.bold.cyan(`📁 Carpeta subBot creada.`))
    }

    const readRutaJadiBot = readdirSync(global.rutaJadiBot)
    if (readRutaJadiBot.length > 0) {
        const creds = 'creds.json'
        for (const gjbts of readRutaJadiBot) {
            const botPath = join(global.rutaJadiBot, gjbts)
            const readBotPath = readdirSync(botPath)
            if (readBotPath.includes(creds)) {
                alyaJadiBot({ pathblackJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' })
            }
        }
    }
}

const pluginFolder = global.__dirname(join(__dirname, '../plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename))
            const module = await import(file)
            global.plugins[filename] = module.default || module
        } catch (e) {
            conn.logger.error(e)
            delete global.plugins[filename]
        }
    }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true)
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
            else {
                conn.logger.warn(`deleted plugin - '${filename}'`)
                return delete global.plugins[filename]
            }
        } else conn.logger.info(`new plugin - '${filename}'`)
        const err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
        })
        if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
        else {
            try {
                const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
                global.plugins[filename] = module.default || module
            } catch (e) {
                conn.logger.error(`error require plugin '${filename}\n${format(e)}`)
            } finally {
                global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
            }
        }
    }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version']),
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => {
                p.on('close', (code) => {
                    resolve(code !== 127)
                })
            }),
            new Promise((resolve) => {
                p.on('error', (_) => resolve(false))
            })
        ])
    }))
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
    const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
    Object.freeze(global.support)
}

function clearTmp() {
    const tmpDir = join(process.cwd(), 'tmp')
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
    const filenames = readdirSync(tmpDir)
    filenames.forEach(file => {
        const filePath = join(tmpDir, file)
        try {
            unlinkSync(filePath)
        } catch (e) { }
    })
}

function purgeSession() {
    let prekey = []
    let directorio = readdirSync(`./${global.sessions}`)
    let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'))
    prekey = [...prekey, ...filesFolderPreKeys]
    filesFolderPreKeys.forEach(files => {
        try {
            unlinkSync(`./${global.sessions}/${files}`)
        } catch (e) { }
    })
}

function purgeSessionSB() {
    try {
        const listaDirectorios = readdirSync(global.rutaJadiBot)
        listaDirectorios.forEach(directorio => {
            if (statSync(join(global.rutaJadiBot, directorio)).isDirectory()) {
                const DSBPreKeys = readdirSync(join(global.rutaJadiBot, directorio)).filter(fileInDir => fileInDir.startsWith('pre-key-'))
                DSBPreKeys.forEach(fileInDir => {
                    if (fileInDir !== 'creds.json') {
                        try {
                            unlinkSync(join(global.rutaJadiBot, directorio, fileInDir))
                        } catch (e) { }
                    }
                })
            }
        })
    } catch (err) {
        console.log(chalk.bold.red(`Error eliminando pre-keys de SB:\n${err}`))
    }
}

function purgeOldFiles() {
    const directories = [`./${global.sessions}/`, global.rutaJadiBot]
    directories.forEach(dir => {
        try {
            readdirSync(dir).forEach(file => {
                if (file !== 'creds.json') {
                    try {
                        unlinkSync(join(dir, file))
                        console.log(chalk.bold.cyanBright(`\n╭» ❍ ARCHIVOS ❍\n│→ ${file} ELIMINADO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
                    } catch (e) { }
                }
            })
        } catch (err) {
            console.log(chalk.bold.red(`\n╭» ❍ ERROR ❍\n│→ No se pudo eliminar archivos en ${dir}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ✘\n` + err))
        }
    })
}

if (!opts['test']) {
    if (global.db) {
        setInterval(async () => {
            try {
                if (global.db.data) await global.db.write()
                if (opts['autocleartmp'] && (global.support || {}).find) {
                    const tmpDirs = [os.tmpdir(), join(process.cwd(), 'tmp'), `${jadi}`]
                    tmpDirs.forEach(dir => cp.spawn('find', [dir, '-amin', '3', '-type', 'f', '-delete']))
                }
            } catch (e) {
                console.error(e)
            }
        }, 30000)
    }
}

setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return
    await clearTmp()
    console.log(chalk.bold.cyanBright(`\n╭» ❍ MULTIMEDIA ❍\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 4)

setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return
    await purgeSession()
    console.log(chalk.bold.cyanBright(`\n╭» ❍ ${global.sessions} ❍\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 10)

setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return
    await purgeSessionSB()
}, 1000 * 60 * 10)

setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return
    await purgeOldFiles()
}, 1000 * 60 * 10)

_quickTest().then(() => conn.logger.info(chalk.bold.magenta(`🌸 Saki - вσт ʟɪsᴛᴀ ᴘᴀʀᴀ ᴜsᴀʀsᴇ 🌸\n`))).catch(console.error)

let stopped

setInterval(async () => {
    if (stopped === 'close' || !conn || !conn?.user) return
    const _uptime = process.uptime() * 1000
    const uptime = clockString(_uptime)
    const bio = `🌸 Saki - вσт | Activo: ${uptime} | EL VIGILANTE`
    await conn?.updateProfileStatus(bio).catch(_ => _)
}, 60000)

function clockString(ms) {
    const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('')
}

async function isValidPhoneNumber(number) {
    try {
        number = number.replace(/\s+/g, '')
        if (number.startsWith('+521')) number = number.replace('+521', '+52')
        else if (number.startsWith('+52') && number[4] === '1') number = number.replace('+52 1', '+52')
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
        return phoneUtil.isValidNumber(parsedNumber)
    } catch {
        return false
    }
}