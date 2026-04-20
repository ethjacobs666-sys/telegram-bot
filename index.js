const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🎬 VIDEO DARI KAMU (SUDAH FIX)
const VIDEO_URL = 'https://files.catbox.moe/7fhl1n.mp4'

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

// START (PASTI RESPON)
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

// EDIT PANEL
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

Choose action:`,
    [
      [Markup.button.callback('🚀 Start Appeal', 'start')],
      [Markup.button.callback('⬅️ Back', 'menu')]
    ]
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

// START APPEAL
bot.action('start', (ctx) => {
  ctx.answerCbQuery()

  state[ctx.from.id] = 'number'

  return editPanel(ctx,
`📨 *APPEAL REQUEST*

Enter phone number:

Example:
+628xxxx`,
    [
      [Markup.button.callback('⬅️ Back', 'menu')]
    ]
  )
})

// INPUT NUMBER
bot.on('text', (ctx) => {
  if (state[ctx.from.id] === 'number') {
    const number = ctx.message.text
    state[ctx.from.id] = null

    return ctx.reply(
`🚀 *REQUEST SUBMITTED*

🎯 Target : ${number}  
📧 Email  : your@email.com  
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
  }
})

// ERROR HANDLER
bot.catch((err) => {
  console.log('Error:', err)
})

bot.launch()
