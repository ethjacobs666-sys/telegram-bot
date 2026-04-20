const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🎬 VIDEO ID
const VIDEO_ID = 'BAACAgUAAxkBAAMqaeYr8ve9kCfCx1-Z8S53f0qLd-WAAjAdAAJSUj1XdJXeruoBFhM7BA'

// state
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

// START PANEL
bot.start((ctx) => {
  return ctx.replyWithVideo(VIDEO_ID, {
    caption: panelText(),
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
      [Markup.button.callback('📧 Email Manager', 'email')],
      [Markup.button.callback('📘 Guide', 'guide')]
    ])
  })
})

// EDIT HELPER
function editPanel(ctx, text, buttons) {
  return ctx.editMessageCaption(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  })
}

// ⚡ QUICK APPEAL MENU
bot.action('appeal', (ctx) => {
  ctx.answerCbQuery()

  return editPanel(ctx,
`⚡ *QUICK APPEAL*

Generate appeal message instantly.

━━━━━━━━━━━━━━━

Choose action:`,
    [
      [Markup.button.callback('🚀 Start Appeal', 'start_appeal')],
      [Markup.button.callback('⬅️ Back', 'menu')]
    ]
  )
})

// BACK
bot.action('menu', (ctx) => {
  ctx.answerCbQuery()

  return editPanel(ctx, panelText(), [
    [Markup.button.callback('⚡ Quick Appeal', 'appeal')],
    [Markup.button.callback('📧 Email Manager', 'email')],
    [Markup.button.callback('📘 Guide', 'guide')]
  ])
})

// START APPEAL
bot.action('start_appeal', (ctx) => {
  ctx.answerCbQuery()

  state[ctx.from.id] = 'number'

  return editPanel(ctx,
`📨 *APPEAL REQUEST*

Enter target phone number:

Example:
+628xxxx`,
    [
      [Markup.button.callback('⬅️ Back', 'menu')]
    ]
  )
})

// INPUT
bot.on('text', (ctx) => {
  const st = state[ctx.from.id]
  if (!st) return

  if (st === 'number') {
    const number = ctx.message.text

    state[ctx.from.id] = null

    return ctx.reply(
`🚀 *REQUEST SUBMITTED*

🎯 Target : ${number}  
📧 Email  : your@email.com  
⚡ Status : QUEUED  

━━━━━━━━━━━━━━━
Please wait for processing.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Back to Panel', 'menu')]
        ])
      }
    )
  }
})

bot.launch()
