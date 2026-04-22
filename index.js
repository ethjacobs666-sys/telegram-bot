const { Telegraf, Markup } = require('telegraf')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 💡 1. KONFIGURASI VIP & LIMIT
const VIP_USERS = process.env.VIP_USERS ? process.env.VIP_USERS.split(',') : [] 
const freeUserUsage = {} 

const VIDEO_URL = 'https://files.catbox.moe/7fhl1n.mp4'

// 📧 2. DAFTAR EMAIL DENGAN NAMA CS INDONESIA
const senders = [
  { email: 'a88033416@gmail.com', webhook: process.env.PASS_1, name: 'Budi Santoso' },
  { email: 'eth.jacobs666@gmail.com', webhook: process.env.PASS_2, name: 'Andi Wijaya' },
  { email: 'aitwo8554@gmail.com', webhook: process.env.PASS_3, name: 'Rina Amelia' },
  { email: 'socialfighter056@gmail.com', webhook: process.env.PASS_4, name: 'Deni Saputra' },
  { email: 'aithree012@gmail.com', webhook: process.env.PASS_5, name: 'Maya Indah' },
  { email: 'abduldilat@gmail.com', webhook: process.env.PASS_6, name: 'Dimas Pratama' },
  { email: 'aifour8576@gmail.com', webhook: process.env.PASS_7, name: 'Siska Anggraeni' },
  { email: 'aifive721@gmail.com', webhook: process.env.PASS_8, name: 'Reza Pahlawan' },
  { email: 'Rakacampus8@gmail.com', webhook: process.env.PASS_9, name: 'Tika Wulandari' },
  { email: 'Andrawijayacamp@gmail.com', webhook: process.env.PASS_10, name: 'Hendra Gunawan' },
  { email: 'Permadireza53@gmail.com', webhook: process.env.PASS_11, name: 'Fitri Handayani' }
]

let currentSenderIndex = 0
const TARGET_EMAIL = 'onehuman133@gmail.com'

// 📝 3. TEMPLATE PESAN APPEAL
const templates = {
  login: `Dear WhatsApp Support Team,\n\nI am writing to report an issue preventing me from registering/logging into my WhatsApp account associated with the phone number {phone}.\n\nWhenever I attempt to access my account, I receive a message stating that I am unable to log in at this time. Despite performing standard troubleshooting steps, including restarting my device and ensuring a stable internet connection, the issue persists.\n\nAs this service is essential for my daily communication, I kindly request that you investigate this matter promptly and provide a clear explanation along with the necessary steps to resolve it.\n\nThank you for your attention to this matter. I look forward to your prompt response.\n\nThank You`,
  
  restricted: `Dear WhatsApp Support Team,\n\nI am writing to formally request a review of my WhatsApp account associated with the phone number {phone}, which has recently been restricted.\n\nAt this time, I have not received a clear explanation regarding the reason for this restriction. To the best of my knowledge, I have not engaged in any activities that violate WhatsApp’s terms of service.\n\nThis restriction has significantly impacted my ability to communicate effectively. Therefore, I respectfully request a thorough review of my account status and a detailed explanation of the restriction. If this action was taken in error, I kindly ask for the restriction to be lifted as soon as possible.\n\nThank you for your time and consideration. I look forward to your response.\n\nThank You`,

  banned: `Dear WhatsApp Support Team,\n\nI am writing to formally appeal the ban imposed on my WhatsApp account associated with the phone number {phone}.\n\nI was surprised to learn that my account has been banned, as I strongly believe that I have not violated any of WhatsApp’s policies or terms of service. This action has caused significant disruption to my personal and professional communications.\n\nI respectfully request an immediate review of my account. If this ban was applied in error, I kindly ask for my account to be reinstated without delay. Alternatively, I would appreciate a clear and detailed explanation regarding the reason for this action.\n\nThank you for your attention to this matter. I look forward to your prompt resolution.\n\nThank You`
}

const state = {}

function panelText(isVip) {
  const mode = isVip ? 'VIP PREMIUM' : 'FREE TIER'
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return `👑 *SILENT APPEAL SYSTEM* 👑

🟢 Status : ACTIVE
📅 Date   : ${dateStr}  
⏰ Time   : ${timeStr} WIB

━━━━━━━━━━━━━━━
💎 Account : ${mode}
━━━━━━━━━━━━━━━

Pilih menu di bawah ini bro:`
}

function maskEmail(email) {
  const parts = email.split('@')
  const name = parts[0]
  if (name.length <= 2) return email
  return `${name.substring(0, 2)}*******@${parts[1]}`
}

bot.start(async (ctx) => {
  try {
    const isVip = VIP_USERS.includes(ctx.from.id.toString())
    await ctx.replyWithVideo(VIDEO_URL, {
      caption: panelText(isVip),
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
        [Markup.button.callback('💎 Upgrade VIP', 'upgrade')],
        [Markup.button.callback('📘 Guide', 'guide')]
      ])
    })
  } catch (e) {
    ctx.reply('Video gagal di-load ❌ tapi bot tetep jalan kok.')
  }
})

function editPanel(ctx, text, buttons) {
  return ctx.editMessageCaption(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  })
}

bot.action('menu', (ctx) => {
  ctx.answerCbQuery()
  const isVip = VIP_USERS.includes(ctx.from.id.toString())
  return editPanel(ctx, panelText(isVip), [
    [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
    [Markup.button.callback('💎 Upgrade VIP', 'upgrade')],
    [Markup.button.callback('📘 Guide', 'guide')]
  ])
})

bot.action('appeal', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, `⚡ *QUICK APPEAL*\n\nPilih tipe masalah WA lu:`, [
    [Markup.button.callback('📱 Login Issue', 'type_login')],
    [Markup.button.callback('⚠️ Restricted', 'type_restricted')],
    [Markup.button.callback('🚫 Banned', 'type_banned')],
    [Markup.button.callback('⬅️ Back', 'menu')]
  ])
})

bot.action('upgrade', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, `💎 *UPGRADE KE VIP PREMIUM*\n\nBiar bisa spam appeal unlimited, gass upgrade!\n\n━━━━━━━━━━━━━━━\n*Cara upgrade:*\n1. Bayar via QRIS / E-Wallet.\n2. Kirim bukti trf ke Admin.\n3. Done! Akun lu otomatis VIP.\n━━━━━━━━━━━━━━━\n👤 *Admin:* @UsernameAdminAbang`, [[Markup.button.callback('⬅️ Back', 'menu')]])
})

bot.action('guide', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, `📘 *CARA PAKE BOT*\n\n━━━━━━━━━━━━━━━\n1. Klik *Quick Appeal*.\n2. Pilih tipe masalahnya.\n3. Masukin Nomor HP (Wajib +62).\n4. Sistem kita yang otomatis ngerolling emailnya.\n━━━━━━━━━━━━━━━`, [[Markup.button.callback('⬅️ Back', 'menu')]])
})

// Milih tipe masalah
bot.action(['type_login', 'type_restricted', 'type_banned'], (ctx) => {
  ctx.answerCbQuery()
  const type = ctx.match[0].replace('type_', '')
  state[ctx.from.id] = { step: 'awaiting_data', type: type }
  return editPanel(ctx, `📨 *APPEAL REQUEST (${type.toUpperCase()})*\n\nKirim nomor WA target lu ke sini:\n\n*(Wajib pakai +62 ya bro!)*\nContoh:\n+628xxxx`, [[Markup.button.callback('⬅️ Batal & Back', 'menu')]])
})

// Eksekusi ngirim email
bot.on('text', async (ctx) => {
  const userId = ctx.from.id.toString()
  if (state[userId] && state[userId].step === 'awaiting_data') {
    const phone = ctx.message.text.trim()
    const appealType = state[userId].type
    const isVip = VIP_USERS.includes(userId)

    // Cek limit gratisan
    if (!isVip && freeUserUsage[userId] >= 1) {
      state[userId] = null
      return ctx.reply(`⚠️ *Yahh, Limit Habis Bro!*\n\nJatah free lu udah kepake nih.\nGas upgrade ke VIP kuy biar bisa spam unlimited! 🚀`, { parse_mode: 'Markdown' })
    }

    // 💡 VALIDASI INPUT NOMOR (WAJIB +62 DAN MINIMAL 10 ANGKA)
    if (!phone.startsWith('+62') || phone.length < 10) {
      return ctx.reply(`⚠️ *Format Salah Coy!*\nNomor WA wajib diawali dengan \`+62\` ya bro.\n\nContoh yang bener: \`+6281234567890\``, { parse_mode: 'Markdown' })
    }

    const currentSender = senders[currentSenderIndex]
    const emailBody = templates[appealType].replace('{phone}', phone)
    
    // Tampilan Loading
    const processingMsg = await ctx.reply(`⏳ *Wait ya, lagi di-proses nih...*\n📧 Pake Sender : \`${maskEmail(currentSender.email)}\``, { parse_mode: 'Markdown' })

    try {
      const response = await fetch(currentSender.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: TARGET_EMAIL,
          subject: `WA Appeal - ${appealType.toUpperCase()} - ${phone}`,
          body: emailBody,
          senderName: currentSender.name 
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        if (!isVip) freeUserUsage[userId] = 1
        currentSenderIndex = (currentSenderIndex + 1) % senders.length
        
        // Tampilan Sukses 
        return ctx.telegram.editMessageText(ctx.chat.id, processingMsg.message_id, null,
`🚀 *REQUEST DONE!*

🎯 Target : \`${phone}\`
👤 Sender : ${currentSender.name}
⚡ Status : *Sukses nembus WA!*

━━━━━━━━━━━━━━━
_⏳ Tunggu sekitar 30 detik, terus coba tes login WA lu lagi ya cuy!_`, 
          { parse_mode: 'Markdown' }
        )
      } else {
        throw new Error(result.message || 'Error dari sananya bro')
      }
    } catch (error) {
      return ctx.telegram.editMessageText(ctx.chat.id, processingMsg.message_id, null,
`❌ *Waduh, Gagal Bro!*\nSystem Log: \`${error.message}\``, 
        { parse_mode: 'Markdown' }
      )
    }
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
