import fetch from 'node-fetch';
import yts from "yt-search";
import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = await import('@whiskeysockets/baileys');
import FormData from "form-data";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*🔎 ¿Que deseas buscar en YouTube?*`);

  await m.react('⏱️')

    async function createImage(img) {
        const { imageMessage } = await generateWAMessageContent({
            image: img
        }, {
            upload: conn.waUploadToServer
        });
        return imageMessage;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let push = [];
    let results = await yts(text);
    let videos = results.videos.slice(0, 9); 
    shuffleArray(videos);

    let i = 1;
    for (let video of videos) {
        let imageUrl = video.thumbnail;
        let imageK = await fetch(imageUrl);
        let imageB = await imageK.buffer();
      let pr = await remini(imageB, "enhance")
        push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `◦ *Título:* ${video.title}\n◦ *Duración:* ${video.timestamp}\n◦ *Vistas:* ${video.views}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: '' 
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: ``,
                hasMediaAttachment: true,
                imageMessage: await createImage(pr) 
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                "name": "cta_copy",
                "buttonParamsJson": JSON.stringify({
                "display_text": "Descargar audio! 🎧",
                "copy_code": `.ytmp3 ${video.url}`
                })
              },{
                "name": "cta_copy",
                "buttonParamsJson": JSON.stringify({
                "display_text": "Descargar video! 📹",
                "copy_code": `.ytmp4 ${video.url}`
                })
              }
                ]
            })
        });
    }

    const bot = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: '*☕ Resultados de:* ' + `*${text}*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: 'YouTube - Search'
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: [...push] // Mengisi carousel dengan hasil video
                    })

                })
            }
        }
    }, {
    'quoted': m
  });

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
  await m.react('✅')
}

handler.help = ["ytsearch2 *<texto>*", "yts *<texto>*"];
handler.tags = ["buscador"];
handler.command = ["ytsearch", "yts"];

export default handler;

async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"]
    if (availableOperations.includes(operation)) {
      operation = operation
    } else {
      operation = availableOperations[0]
    }
    const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro"
    const formData = new FormData()
    formData.append("image", Buffer.from(imageData), {filename: "enhance_image_body.jpg", contentType: "image/jpeg"})
    formData.append("model_version", 1, {"Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8"})
    formData.submit({url: baseUrl, host: "inferenceengine.vyro.ai", path: "/" + operation, protocol: "https:", headers: {"User-Agent": "okhttp/4.9.3", Connection: "Keep-Alive", "Accept-Encoding": "gzip"}},
      function (err, res) {
        if (err) reject(err);
        const chunks = [];
        res.on("data", function (chunk) {chunks.push(chunk)});
        res.on("end", function () {resolve(Buffer.concat(chunks))});
        res.on("error", function (err) {
        reject(err);
        });
      },
    )
  })
}
