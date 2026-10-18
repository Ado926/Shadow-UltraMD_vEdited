import fetch from 'node-fetch'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = await import('@whiskeysockets/baileys')

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('*[ ℹ️ ] Ingresa el texto de lo que quieres buscar en Spotify*\n\n*[ 💡 ] Ejemplo:* .spotifysearch Gata Only');
await m.react('🕓');

try {
async function createImage(url) {
const { imageMessage } = await generateWAMessageContent({image: { url }}, {upload: conn.waUploadToServer})
return imageMessage
}

let push = [];
let api = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
let json = await api.json()

for (let track of json.data) {
let image = await createImage(track.image)

/* push.push({
body: proto.Message.InteractiveMessage.Body.fromObject({
text: '${track.title} - ${track.artist}'
}),
footer: proto.Message.InteractiveMessage.Footer.fromObject({text: `${dev}`}),
header: proto.Message.InteractiveMessage.Header.fromObject({title: '', hasMediaAttachment: true, imageMessage: image}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
buttons: [ */ 

        push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `◦ *Título:* ${track.title} \n◦ *Artistas:* ${track.artist} \n◦ *Duración:* ${track.duration} \n◦ *Popularidad:* ${track.popularity} \n◦ *Fecha:* ${track.publish}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: '' 
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: '',
                hasMediaAttachment: true,
                imageMessage: image 
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
{
"name": "cta_copy",
"buttonParamsJson": "{\"display_text\":\"ძᥱsᥴᥲrgᥲr ᥲᥙძі᥆\",\"id\":\"123456789\",\"copy_code\":\"spotify " + track.url + "\"}"
},
]
})
});
}

const msg = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({text: '*`\Resultados de:\`* ' + `${text}`}),
footer: proto.Message.InteractiveMessage.Footer.create({text: '_\`ꜱ\` \`ᴘ\` \`-\` \`ꜱ\` \`ᴇ\` \`ᴀ\` \`ʀ\` \`ᴄ\` \`ʜ\`_'}),
header: proto.Message.InteractiveMessage.Header.create({hasMediaAttachment: false}),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({cards: [...push]})
})
}}}, {
    'quoted': m
  });

await m.react('✅');
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
} catch (error) {
console.error(error)
}}

handler.help = ["spotifysearch *<texto>*"]
handler.tags = ["search"]
handler.customPrefix = /s|@|./i;
handler.command = /^(spotifysearch|spsearch|potifysearch|psearch)$/i

export default handler