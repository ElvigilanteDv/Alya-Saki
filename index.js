import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { existsSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'

console.log(chalk.bold.hex('#FF69B4')('\n🌸─ Iɴɪᴄɪᴀɴᴅᴏ αℓуα - вσт ─🌸'))

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
require(join(__dirname, './package.json'))

async function iniciarBot() {
  console.clear()
  console.log(chalk.bold.hex('#FF69B4')('\n⟦ 🌸 αℓуα - вσт V.1.0 🌸 ⟧'))
  console.log(chalk.gray('🎀 Iɴɪᴄɪᴀʟɪᴢᴀɴᴅᴏ sɪsᴛᴇᴍᴀ...'))
  await new Promise(res => setTimeout(res, 600))

  cfonts.say('ALYA', {
    font: 'block',
    align: 'center',
    colors: ['#FF69B4', '#FFB6C1', '#FF1493'],
    letterSpacing: 1
  })

  console.log(chalk.bold.hex('#FF69B4')(`
ㅤ    ꒰  ㅤ 🌸 ㅤ *αℓуα - вσт* ㅤ ⫏⫏  ꒱
ㅤ    ⿻ ㅤ ✿ ㅤ єη αíяє 木 🚀 ㅤ 性

> ₊· ⫏⫏ ㅤ *Vᴇʀsɪóɴ:* 1.0
> ₊· ⫏⫏ ㅤ *Cʀᴇᴀᴅᴏʀ:* Lʏᴏɴɴ
  `))

  await new Promise(res => setTimeout(res, 800))

  console.log(chalk.bold.hex('#FF69B4')('\n⌬═════════════════════⌬'))
  console.log(chalk.bold.white('      BOT CREADO POR: ') + chalk.bold.hex('#FFB6C1')('🔖 LYONN 🔖'))
  console.log(chalk.bold.hex('#FF69B4')('⌬═══════════════════════⌬\n'))

  await new Promise(res => setTimeout(res, 1200))
}

let isRunning = false
function start(file) {
  if (isRunning) return
  isRunning = true
  let args = [join(__dirname, 'Alya-Bot', file), ...process.argv.slice(2)]
  setupMaster({ exec: args[0], args: args.slice(1) })
  let p = fork()
  p.on('exit', (_, code) => {
    isRunning = false
    if (code !== 0) start(file)
  })
}

const archivoArranque = './.arranque-ok'
if (!existsSync(archivoArranque)) {
  await iniciarBot()
  writeFileSync(archivoArranque, 'LYONN_FINAL')
}

start('start.js')
