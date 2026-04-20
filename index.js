const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🎬 VIDEO ID (SUDAH FIX)
const VIDEO_ID = 'BAACAgUAAxkBAAMqaeYr8ve9kCfCx1-Z8S53f0qLd-WAAjAdAAJSUj1XdJXeruoBFhM7BA'

// state
const state = {}

// PANEL TEXT
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

// START (WAJIB RESPON)
bot.start(async (ctx) => {
  try {
    await ctx.replyWithVideo(VIDEO_ID, {
      caption: panelText(),
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
        [Markup.button.callback('📧 Email Manager', 'email')],
        [Markup.button.callback('📘 Guide', 'guide')]
      ])
    })
  } catch (err) {
    console.log(err)
    ctx.reply('Bot running but video failed ❌')
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
bot.action('appeal', async (ctx) => {
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
bot.action('menu', async (ctx) => {
  ctx.answerCbQuery()

  return editPanel(ctx, panelText(), [
    [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
    [Markup.button.callback('📧 Email Manager', 'email')],
    [Markup.button.callback('📘 Guide', 'guide')]
  ])
})

// START APPEAL
bot.action('start', async (ctx) => {
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
bot.on('text', async (ctx) => {
  const st = state[ctx.from.id]
  if (!st) return

  if (st === 'number') {
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

// ERROR HANDLER (BIAR GA DIAM)
bot.catch((err) => {
  console.log('Error:', err)
})

// LAUNCH
bot.launch()
