
return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return {
        status: true,
        code: 200,
        data: response
      };
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        error: error.message
      };
    }
  },

  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!response.status) return response;
    return {
      status: true,
      code: 200,
      data: response.data.cdn
    };
  },

  download: async (link, format) => {
    if (!link) {
      return {
        status: false,
        code: 400,
        error: "¿Dónde está el link? No puedes descargar sin un link 🗿"
      };
    }

    if (!savetube.isUrl(link)) {
      return {
        status: false,
        code: 400,
        error: "¡Pon un link de YouTube válido, por favor! 🗿"
      };
    }

    if (!format || !savetube.formats.includes(format)) {
      return {
        status: false,
        code: 400,
        error: "Formato no disponible, elige uno de los que están listados 🗿",
        available_fmt: savetube.formats
      };
    }

    const id = savetube.youtube(link);
    if (!id) {
      return {
        status: false,
        code: 400,
        error: "No se puede extraer el link de YouTube, verifica el link y prueba de nuevo 😂"
      };
    }

    try {
      const cdnx = await savetube.getCDN();
      if (!cdnx.status) return cdnx;
      const cdn = cdnx.data;

      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
        url: `https://www.youtube.com/watch?v=${id}`
      });
      if (!result.status) return result;
      const decrypted = await savetube.crypto.decrypt(result.data.data);

      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id: id,
        downloadType: format === 'mp3' ? 'audio' : 'video',
        quality: format === 'mp3' ? '128' : format,
        key: decrypted.key
      });

      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Desconocido 🤷🏻",
          type: format === 'mp3' ? 'audio' : 'video',
          format: format,
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          download: dl.data.data.downloadUrl,
          id: id,
          key: decrypted.key,
          duration: decrypted.duration,
          quality: format === 'mp3' ? '128' : format,
          downloaded: dl.data.data.downloaded || false
        }
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        error: error.message
      };
    }
  }
};

const handler = async (m, { conn, args, command }) => {
  if (args.length < 1) return m.reply(`*[ ℹ️ ] Ingresa una URL de un video o audio de YouTube*`);

  let url = args[0];
  let format = command === 'ytmp3' ? 'mp3' : args[1] || '720';

  if (!savetube.isUrl(url)) return m.reply("Por favor, ingresa un link válido de YouTube.");

  try {
    await m.react('🕒');
    let res = await savetube.download(url, format);
    if (!res.status) {
      await m.react('✖️');
      return m.reply(`*Error:* ${res.error}`);
    }

    let { title, download, type } = res.result;

    if (type === 'video') {
      await conn.sendMessage(m.chat, { 
        video: { url: download }
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { 
        audio: { url: download }, 
        mimetype: 'audio/mpeg', ptt: true,
        fileName: `${title}.mp3` 
      }, { quoted: m });
    }
    await m.react('✅');
  } catch (e) {
    await m.react('✖️');
    m.reply(`*¡Fallo en la descarga!*`);
  }
};

handler.help = ['ytmp4 *<url>*', 'ytmp3 *<url>*'];
handler.command = ['ytmp4', 'ytmp3'];
handler.customPrefix = /y|@|./i;
handler.tags = ['dl']

export default handler;
