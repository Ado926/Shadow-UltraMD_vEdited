
let handler = async (m, { conn }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let name = conn.getName(who);
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://qu.ax/QGAVS.jpg');
    await conn.sendFile(m.chat, pp, 'profile.jpg', `*🍪 Foto de perfil de \`${name}\`*`, m);
}

handler.help = ['pfp @user'];
handler.tags = ['sticker'];
handler.command = ['pfp'];

export default handler;