import FormData from "form-data"

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.hdr = conn.hdr ? conn.hdr : {}
  if (m.sender in conn.hdr)
    throw m.reply("✧ Aún hay procesos en el chat >//<");
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ""
  if (!mime)
    throw m.reply(`*[ ℹ️ ] Etiqueta una Imagen.*`)
  if (!/image\/(jpe?g|png)/.test(mime))
    throw m.reply(`*[ ℹ️ ] Etiqueta una Imagen.*`);
  else conn.hdr[m.sender] = true;
  m.reply("*Mejorando la calidad de imagen...*")
  let img = await q.download?.()
  let error
  try {
    const This = await processing(img, "enhance")
    conn.sendFile(m.chat, This, "", "*Listo :3*", m)
  } catch (er) {
    error = true
  } finally {
    if (error) {
      m.reply("Error :(")
    }
    delete conn.hdr[m.sender]
  }
}

handler.help = ['hd *<img>*', 'remini *<img>*']
handler.tags = ['herramientas']
handler.command = /^(hd|remini)$/i
handler.register = true
handler.before = async (m, { conn }) => {
    let text = m.text?.toLowerCase()?.trim();
    if (text === 'hd' || text === 'hd') {
        return handler(m, { conn });
    }
}
export default handler

async function processing(urlPath, method) {
  return new Promise(async (resolve, reject) => {
    let Methods = ["enhance"]
    Methods.includes(method) ? (method = method) : (method = Methods[0]);
    let buffer,
      Form = new FormData(),
      scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method;
    Form.append("model_version", 1, {
      "Content-Transfer-Encoding": "binary",
      contentType: "multipart/form-data; charset=uttf-8",
    });
    Form.append("image", Buffer.from(urlPath), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    });
    Form.submit(
      {
        url: scheme,
        host: "inferenceengine" + ".vyro" + ".ai",
        path: "/" + method,
        protocol: "https:",
        headers: {
          "User-Agent": "okhttp/4.9.3",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
        },
      },
      function (err, res) {
        if (err) reject();
        let data = [];
        res
          .on("data", function (chunk, resp) {
            data.push(chunk);
          })
          .on("end", () => {
            resolve(Buffer.concat(data));
          });
        res.on("error", (e) => {
          reject();
        });
      }
    );
  });
}