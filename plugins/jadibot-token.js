
import fs from "fs"
let handler = async (m, { conn, usedPrefix }) => {
 try {
    const user = m.sender.split("@")[0]
    if (fs.existsSync("./ShadowJadiBot/" + user + "/creds.json")) {
        let token = Buffer.from(fs.readFileSync("./ShadowJadiBot/" + user + "/creds.json"), "utf-8").toString("base64")
        await conn.reply(m.chat, `El token te permite iniciar sesion en otros bots, recomendamos no compartirlo con nadie.\n\n*Tu token es:*`, m, rcanal)
        await conn.reply(m.chat, token, m, rcanal)
    } else {
        await conn.reply(m.chat, `🚩 No tienes token, crea tu token usando: ${usedPrefix}code`, m, rcanal)
    }
  } catch (e) {
    console.error(e)
  }
}
handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
handler.tags = ['code'];
handler.register = true
handler.private = true
handler.estrellas = 4;
export default handler;
