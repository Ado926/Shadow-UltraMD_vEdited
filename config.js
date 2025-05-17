import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.owner = [
   ['51927238856', 'Cristian Escobar', true],
   ['50493732693', 'Wirk', true],
   ['573133374132', 'YoSoyYo', true]
]

global.creadorbot = [
   ['51927238856', 'Cristian Escobar', true]
]

global.mods = ['51990841568', '51965911060']
global.prems = ['51965911060']


global.packname = '🩸NASARETH 😈'
global.botname = '👹🖤Ｈａｒｏｌｄ－Ｂｏｔ－Ｏｆｉｃｉａｌ😈💫'
global.wm = '⏤͟͟͞͞⋆⬪࣪ꥈ☕★ ׄ ꒱ Harold Ofc ୭'
global.autor = '𓆩‌۫᷼ ִֶָღܾ݉͢𝐇ꪖR͟ꪮ𝑙ᦔ𓆪‌'
global.dev = '© Powered by 𓆩‌۫᷼ ִֶָღܾ݉͢𝐇ꪖR͟ꪮ𝑙ᦔ𓆪‌'
global.errorm = 'Error: ${error.message}'
global.nombrebot = 'Harold Bot - MD'
global.textbot = `「 HAROLD BOT MD 」`
global.vs = '3.0.0'


global.imagen1 = fs.readFileSync('./media/menus/Menu.jpg')
global.imagen2 = fs.readFileSync('./media/menus/Menu2.jpg')
global.imagen3 = fs.readFileSync('./media/menus/Menu3.jpg')
global.welcome = fs.readFileSync('./media/welcome.jpg')
global.adios = fs.readFileSync('./media/adios.jpg')
global.catalogo = fs.readFileSync('./media/catalogo.jpg')
global.shadowurl = fs.readFileSync('./media/shadowurl.jpg')


global.repobot = 'https://github.com/CrxstianEscobar/ShadowUltra-MD'
global.grupo = 'https://chat.whatsapp.com/FCS6htvAmlT7nq006lxU4I'
global.comu = 'https://chat.whatsapp.com/Kn1pPVAO08pFRo7qJnKuh6'
global.channel = 'https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n'
global.insta = 'https://www.instagram.com/shadowbot.md'


global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "543876577197-120363317332020195@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: 'HAROLD 乂 TEAM', orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}


global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment        


global.multiplier = 69 
global.maxwarn = '3'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
