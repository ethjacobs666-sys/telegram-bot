const { Telegraf, Markup } = require('telegraf')
const nodemailer = require('nodemailer')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🎬 VIDEO DARI KAMU
const VIDEO_URL = 'https://files.catbox.moe/7fhl1n.mp4'

// 📧 1. SENDER EMAILS CONFIGURATION (ROLLING SYSTEM)
const senders = [
  { email: 'a88033416@gmail.com', pass: process.env.PASS_1 },
  { email: 'eth.jacobs666@gmail.com', pass: process.env.PASS_2 },
  { email: 'aitwo8554@gmail.com', pass: process.env.PASS_3 },
  { email: 'socialfighter056@gmail.com', pass: process.env.PASS_4 },
  { email: 'aithree012@gmail.com', pass: process.env.PASS_5 },
  { email: 'abduldilat@gmail.com', pass: process.env.PASS_6 },
  { email: 'aifour8576@gmail.com', pass: process.env.PASS_7 },
  { email: 'aifive721@gmail.com', pass: process.env.PASS_8 },
  { email: 'Rakacampus8@gmail.com', pass: process.env.PASS_9 },
  { email: 'Andrawijayacamp@gmail.com', pass: process.env.PASS_10 },
  { email: 'Permadireza53@gmail.com', pass: process.env.PASS_11 }
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
  return `👑 *SILENT APPEAL SYSTEM*

🟢 Status : ACTIVE  
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

// EDIT PANEL HELPER
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

System will automatically rotate sender email for every appeal submitted to prevent rate limits.`, 
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
3. Send Phone Number & Contact Email separated by a comma.
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
      return ctx.reply(
`⚠️ *INVALID FORMAT*

Please enter a valid phone number.
Example: \`+628xxxx\``, 
        { parse_mode: 'Markdown' }
      )
    }

    const currentSender = senders[currentSenderIndex]

    if (!currentSender.pass) {
      return ctx.reply(`❌ *System Error:* App Password for \`${currentSender.email}\` is not configured in Railway.`, { parse_mode: 'Markdown' })
    }

    const emailBody = templates[appealType]
      .replace('{email}', currentSender.email)
      .replace('{phone}', phone)

    const maskedEmailText = maskEmail(currentSender.email)

    const processingMsg = await ctx.reply(
`⏳ *PROCESSING APPEAL...*
📧 Using Sender & Contact : \`${maskedEmailText}\``, 
      { parse_mode: 'Markdown' }
    )

    try {
      // 💡 PERBAIKAN RUTE SMTP DI SINI (Memaksa rute via Port 465)
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Gunakan SSL
        auth: {
          user: currentSender.email,
          pass: currentSender.pass
        }
      })

      const mailOptions = {
        from: currentSender.email,
        to: TARGET_EMAIL,
        subject: `WhatsApp Support - Appeal (${appealType.toUpperCase()}) - ${phone}`,
        text: emailBody
      }

      await transporter.sendMail(mailOptions)

      // Clear state and rotate sender index (0 to 10)
      state[userId] = null
      currentSenderIndex = (currentSenderIndex + 1) % senders.length

      return ctx.reply(
`🚀 *REQUEST SUBMITTED*

🎯 Target : ${phone}  
📧 Email Used : \`${maskedEmailText}\`  
⚡ Status : SUCCESS  

━━━━━━━━━━━━━━━
Please wait before next request.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back to Panel', 'menu')]
          ])
        }
      )

    } catch (error) {
      console.log('Nodemailer Error:', error)
      return ctx.reply(`❌ *Failed to send email.* Connection error or invalid App Password.`, { parse_mode: 'Markdown' })
    }
  }
})

// ERROR HANDLER
bot.catch((err) => {
  console.log('Error:', err)
})

bot.launch()

// 💡 PERBAIKAN ANTI-BENTROK DI SINI (Mencegah Error 409)
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
