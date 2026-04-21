const { Telegraf, Markup } = require('telegraf')

// Memaksa DNS ke IPv4 agar koneksi internet mesin Railway lebih stabil
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🎬 VIDEO DARI KAMU
const VIDEO_URL = 'https://files.catbox.moe/7fhl1n.mp4'

// 📧 1. SENDER CONFIGURATION (ROLLING SYSTEM)
// PASS_1 sampai PASS_11 sekarang berisi Link Web App URL dari Google Apps Script
const senders = [
  { email: 'a88033416@gmail.com', webhook: process.env.PASS_1 },
  { email: 'eth.jacobs666@gmail.com', webhook: process.env.PASS_2 },
  { email: 'aitwo8554@gmail.com', webhook: process.env.PASS_3 },
  { email: 'socialfighter056@gmail.com', webhook: process.env.PASS_4 },
  { email: 'aithree012@gmail.com', webhook: process.env.PASS_5 },
  { email: 'abduldilat@gmail.com', webhook: process.env.PASS_6 },
  { email: 'aifour8576@gmail.com', webhook: process.env.PASS_7 },
  { email: 'aifive721@gmail.com', webhook: process.env.PASS_8 },
  { email: 'Rakacampus8@gmail.com', webhook: process.env.PASS_9 },
  { email: 'Andrawijayacamp@gmail.com', webhook: process.env.PASS_10 },
  { email: 'Permadireza53@gmail.com', webhook: process.env.PASS_11 }
]

let currentSenderIndex = 0
const TARGET_EMAIL = 'onehuman133@gmail.com'

// 📝 2. EMAIL TEMPLATES
const templates = {
  login: `Dear WhatsApp Support Team,\n\nI hope this message finds you well.\n\nI am writing to kindly request assistance with my WhatsApp account. I am currently unable to log in and receive the message "cannot log in at this time".\n\nBelow are my account details:\n• Email          : {email}\n• Phone Number   : {phone}\n\nI would greatly appreciate it if you could help me resolve this login issue so I can regain access to my account as soon as possible.\n\nThank you very much for your time and support. I look forward to your assistance.`,
  
  restricted: `Dear WhatsApp Support Team,\n\nI hope you are doing well.\n\nI am reaching out to appeal the restriction on my WhatsApp account. When I try to use the app, I see the message "Your account is restricted right now."\n\nHere are my account details:\n• Email          : {email}\n• Phone Number   : {phone}\n\nI believe this may have been a mistake or I may have unintentionally violated a policy. I would really appreciate it if you could review my account and help lift the restriction so I can continue using WhatsApp normally.\n\nThank you for your understanding and for taking the time to assist me. I am looking forward to your positive response.`
}

const state = {}

function panelText() {
  return `👑 *SILENT APPEAL SYSTEM* 👑

🟢 Status : ACTIVE (API ROLLING)  
📅 Date   : ${new Date().toLocaleDateString()}  
⏰ Time   : ${new Date().toLocaleTimeString()}

━━━━━━━━━━━━━━━
💎 System Mode : PREMIUM
━━━━━━━━━━━━━━━

Select a feature below:`
}

// FUNGSI SENSOR EMAIL (Contoh: a8*******@gmail.com)
function maskEmail(email) {
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return email;
  const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
  return `${maskedName}@${domain}`;
}

// START
bot.start(async (ctx) => {
  try {
    await ctx.replyWithVideo(VIDEO_URL, {
      caption: panelText(),
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
        [Markup.button.callback('📧 Email Manager', 'email')],
        [Markup.button.callback('📘 Guide', 'guide')]
      ])
    })
  } catch (e) {
    console.log(e)
    ctx.reply('Video failed ❌ but bot is alive')
  }
})

function editPanel(ctx, text, buttons) {
  return ctx.editMessageCaption(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  })
}

// MENU APPEAL
bot.action('appeal', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx,
`⚡ *QUICK APPEAL*

Generate appeal message instantly.

━━━━━━━━━━━━━━━

Select issue type:`,
    [
      [Markup.button.callback('📱 Login Issue', 'type_login')],
      [Markup.button.callback('🚫 Restricted', 'type_restricted')],
      [Markup.button.callback('⬅️ Back', 'menu')]
    ]
  )
})

// EMAIL MANAGER
bot.action('email', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, 
`📧 *EMAIL MANAGER*

━━━━━━━━━━━━━━━
🟢 Auto-Rolling System : ACTIVE
🗂 Total Senders Configured : 11
🎯 Target : ${TARGET_EMAIL}
━━━━━━━━━━━━━━━

System will automatically rotate between your 11 Google Scripts to send the appeal messages.`, 
    [[Markup.button.callback('⬅️ Back', 'menu')]]
  )
})

// GUIDE 
bot.action('guide', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, 
`📘 *HOW TO USE*

━━━━━━━━━━━━━━━
1. Click *Quick Appeal*.
2. Select your issue type (Login/Restricted).
3. Send Phone Number ONLY.
4. Bot will automatically format the template and send it using our rolling email system.
━━━━━━━━━━━━━━━`, 
    [[Markup.button.callback('⬅️ Back', 'menu')]]
  )
})

// BACK MENU
bot.action('menu', (ctx) => {
  ctx.answerCbQuery()
  return editPanel(ctx, panelText(), [
    [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
    [Markup.button.callback('📧 Email Manager', 'email')],
    [Markup.button.callback('📘 Guide', 'guide')]
  ])
})

// START APPEAL (SELECTING TYPE)
bot.action(['type_login', 'type_restricted'], (ctx) => {
  ctx.answerCbQuery()

  const type = ctx.match[0] === 'type_login' ? 'login' : 'restricted'
  state[ctx.from.id] = { step: 'awaiting_data', type: type }

  return editPanel(ctx,
`📨 *APPEAL REQUEST (${type.toUpperCase()})*

Enter Phone Number:

Example:
+628xxxx`,
    [
      [Markup.button.callback('⬅️ Cancel & Back', 'menu')]
    ]
  )
})

// INPUT NUMBER -> PROCESS MAILING
bot.on('text', async (ctx) => {
  const userId = ctx.from.id

  if (state[userId] && state[userId].step === 'awaiting_data') {
    const phone = ctx.message.text.trim()
    const appealType = state[userId].type

    if (phone.length < 5) {
      return ctx.reply(`⚠️ *INVALID FORMAT*\nPlease enter a valid phone number.\nExample: \`+628xxxx\``, { parse_mode: 'Markdown' })
    }

    // AMBIL EMAIL SESUAI URUTAN ROLLING
    const currentSender = senders[currentSenderIndex]

    // Pengecekan apakah URL Webhook sudah diisi dengan benar di Railway
    if (!currentSender.webhook || !currentSender.webhook.includes('script.google.com')) {
      return ctx.reply(`❌ *System Error:* Webhook URL for \`${maskEmail(currentSender.email)}\` is missing or invalid in Railway.\nPlease set it in the Variables first!`, { parse_mode: 'Markdown' })
    }

    const emailBody = templates[appealType]
      .replace('{email}', currentSender.email)
      .replace('{phone}', phone)

    const maskedEmailText = maskEmail(currentSender.email)

    const processingMsg = await ctx.reply(`⏳ *PROCESSING APPEAL...*\n📧 Using Sender : \`${maskedEmailText}\``, { parse_mode: 'Markdown' })

    try {
      // 💡 TEKNIK NINJA: Mengirim ke Google Script (Bypass Port 587)
      const response = await fetch(currentSender.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: TARGET_EMAIL,
          subject: `WhatsApp Support - Appeal (${appealType.toUpperCase()}) - ${phone}`,
          body: emailBody
        })
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Error from GAS Webhook');
      }

      // SUKSES -> BERSIHKAN MEMORI & PINDAH KE EMAIL BERIKUTNYA (ROLLING)
      state[userId] = null
      currentSenderIndex = (currentSenderIndex + 1) % senders.length

      return ctx.reply(
`🚀 *REQUEST SUBMITTED*

🎯 Target : ${phone}  
📧 Email Used : \`${maskedEmailText}\`  
⚡ Status : SUCCESS (BYPASS)

━━━━━━━━━━━━━━━
Rolling to next sender for next request.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back to Panel', 'menu')]
          ])
        }
      )

    } catch (error) {
      console.log('Rolling Error:', error)
      return ctx.reply(`❌ *Failed to send email.*\nSystem Log: \`${error.message}\``, { parse_mode: 'Markdown' })
    }
  }
})

// ERROR HANDLER & ANTI-CRASH
bot.catch((err) => {
  console.log('Bot Error:', err)
})

bot.launch()

// GRACEFUL STOP MENCEGAH ERROR 409
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
