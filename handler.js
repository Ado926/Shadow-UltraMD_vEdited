import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = await import('@whiskeysockets/baileys')
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.diamantes = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.diamantes))
                    user.diamantes = 10
                if (!('premium' in user)) 
                    user.premium = false
                if (!user.premium) 
                    user.premiumTime = 0
                if (!('registered' in user))
                    user.registered = false
                if (!user.registered) {
                    if (!('name' in user))
                        user.name = m.name
                    if (!isNumber(user.age))
                        user.age = -1
                    if (!isNumber(user.regTime))
                        user.regTime = -1
                }
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('banned' in user))
                    user.banned = false
                if (!('useDocument' in user))
                    user.useDocument = false
                if (!isNumber(user.level))
                    user.level = 0
                if (!isNumber(user.bank))
                    user.bank = 0
            } else
                global.db.data.users[m.sender] = {
                    exp: 0,
                    diamantes: 10,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    useDocument: false,
                    bank: 0,
                    level: 0,
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat))
                    chat.isBanned = false
                if (!('welcome' in chat))
                    chat.welcome = true
                if (!('audios' in chat))
                    chat.audios = false
                if (!('detect' in chat))
                    chat.detect = true 
                if (!('antiLink' in chat))
                    chat.antiLink = true
                if (!('antiLink2' in chat))
                    chat.antiLink2 = true
                if (!('onlyLatinos' in chat))
                    chat.onlyLatinos = false
                if (!('nsfw' in chat))
                    chat.nsfw = false
                if (!('autoAceptar' in chat)) chat.autoAceptar = false                   
                if (!('reaction' in chat))
                    chat.reaction = false
                if (!('simi' in chat))
                    chat.simi = false
                if (!('autolevelup' in chat))  chat.autolevelup = false
                if (!('antiBot' in chat))
                     chat.antiBot = false
                if (!('antiBot2' in chat))
                     chat.antiBot2 = false
                if (!('antiver' in chat))
                    chat.antiver = false
                if (!('delete' in chat))
                    chat.delete = false
                if (!isNumber(chat.expired))
                    chat.expired = 0
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    delete: false,
                    audios: false,
                    detect: true,
                    antiLink: true,
                    antiLink2: true,
                    onlyLatinos: false,
                    simi: false,
                    autolevelup: false,
                    antiBot: false,
                    antiBot2: false,
                    antiver: false,
                    nsfw: false, 
                    autoAceptar: false,
                    reaction: false,
                    expired: 0, 
                }
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
               if (!('self' in settings)) settings.self = false
               if (!('restrict' in settings)) settings.restrict = true
                if (!('jadibotmd' in settings)) settings.jadibotmd = false
               if (!('autobio' in settings)) settings.autobio = false
                if (!('antiPrivate' in settings)) settings.antiPrivate = false
                if (!('autoread' in settings)) settings.autoread = true
                if (!('autoread2' in settings)) settings.autoread2 = true
                if (!('antiSpam' in settings)) settings.antiSpam = false
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                restrict: true,
                jadibotmd: false,
                autobio: false,
                antiPrivate: false,
                autoread: true,
                autoread2: true,
                antiSpam: false,
                status: 0
            }
        } catch (e) {
            console.error(e)
        }
        if (opts['nyimak'])  return
        if (!m.fromMe && opts['self'])  return
        if (opts['swonly'] && m.chat !== 'status@broadcast')  return
        if (typeof m.text !== 'string')
            m.text = ''


        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        // const isMods = [conn.decodeJid(global.conn.user.id), ...global.mods.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isOwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.prem == true || isMods;

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix

        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? 
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? 
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ? 
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? 
                            plugin.command === command :
                            false

                if (!isAccept) {
continue
}
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['owner-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return // Except this
if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned && !isROwner) return 
if (m.text && user.banned && !isROwner) {
if (user.antispam > 2) return
m.reply(`*🚫 Está baneado(a), no puede usar los comandos de este bot!*\n\n${user.bannedReason ? `\n💌 *Motivo:* 
${user.bannedReason}` : '💌 *Motivo:* Sin Especificar'}\n\n⚠️ *Si cree que es un error contacte con mi creador:*\n- Wa.me/51927238856`)
user.antispam++        
return
}

//Modoadmin
let hl = global.prefix 
let adminMode = chat.modoadmin
let isPotentialCommand = plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl || m.text.slice(0, 1) == hl || plugins.command

if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && isPotentialCommand) continue

//Antispam 2                
/*if (user.antispam2 && isROwner) return
let time = global.db.data.users[m.sender].spam + 3000
if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`)*/
global.db.data.users[m.sender].spam = new Date * 1
}
              //  m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    let setting = global.db.data.settings[this.user.jid]
                    if (name != 'owner-unbanchat.js' && chat?.isBanned)
                        return 
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                    if (name != 'owner-unbanbot.js' && setting?.banned)
                        return
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) { 
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { 
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { 
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { 
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { 
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { 
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
}
              if (plugin.register == true && _user.registered == false) { 
              fail('unreg', m, this)
            continue
           }
             m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
                if (xp > 200)
                    m.reply('chirrido -_-')
                else
                    m.exp += xp
                if (!isPrems && plugin.diamantes && global.db.data.users[m.sender].diamantes < plugin.diamantes * 1) {
                    conn.reply(m.chat, `*Se agotaron tus Diamantes 💎*`, m)
                    continue
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.diamantes = m.diamantes || plugin.diamantes || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.diamantes)
                        conn.reply(m.chat, `Utilizaste *${+m.diamantes}* Diamantes 💎`, m)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.diamantes -= m.diamantes * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
     if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) { 
      console.log(m, m.quoted, e)}
       let settingsREAD = global.db.data.settings[this.user.jid] || {}  
      if (opts['autoread']) await this.readMessages([m.key])
      if (settingsREAD.autoread2) await this.readMessages([m.key])  

     if (db.data.chats[m.chat].reaction && m.text.match(/(ción|navidad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|adow|a|s)/gi)) {
         let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
       if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
       }
     function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]}
       }}

export async function deleteUpdate(message) {
try {
const { fromMe, id, participant } = message
if (fromMe) return 
let msg = this.serializeM(this.loadMessage(id))
let chat = global.db.data.chats[msg?.chat] || {}
if (!chat?.delete) return 
if (!msg) return 
if (!msg?.isGroup) return 
const antideleteMessage = `╭•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊
│❒ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢:
│• @${participant.split`@`[0]}
│
│❒ 𝗔𝗰𝗮𝗯𝗮 𝗱𝗲 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗿 𝘂𝗻 𝗺𝗲𝗻𝘀𝗮𝗷𝗲
│𝗿𝗲𝗲𝗻𝘃𝗶𝗮𝗻𝗱𝗼... ⏱️
╰•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊`.trim();
await this.sendMessage(msg.chat, {text: antideleteMessage, mentions: [participant]}, {quoted: msg})
this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
} catch (e) {
console.error(e)
}}

global.dfail = (type, m, conn) => {

let user2 = m.pushName || 'Anónimo'

const msg = {
rowner: '*[ ℹ️ ] Esta función solo puede ser usada por mi Creador.*', 
owner: '*[ ℹ️ ] Esta función solo puede ser usada por mi desarrollador.*', 
mods: '*[ ℹ️ ] Esta función solo puede ser usada los moderadores del bot.*', 
premium: '*[ ℹ️ ] Esta función solo es para usuarios Premium.*', 
group: '*[ ℹ️ ] Esta funcion solo puede ser ejecutada en grupos.*', 
private: '*[ ℹ️ ] Esta función solo puede ser usada en chat privado.*', 
admin: '*[ ℹ️ ] Este comando solo puede ser usado por admins.*', 
botAdmin: '*[ ℹ️ ] Para usar esta función debo ser admin.*',
unreg: `*[ ℹ️ ] No te encuentras registrado, registrese para usar esta función*\n\n*.reg <nombre.edad>*\n\n*[ 💡 ] Ejemplo:*\n> .reg ${user2}.18`,
restrict: '*[ ℹ️ ] Esta característica esta desactivada.*'
}[type];
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
