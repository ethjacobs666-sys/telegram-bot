const { Telegraf, Markup } = require('telegraf')
const { Low, JSONFile } = require('lowdb')

const bot = new Telegraf(process.env.BOT_TOKEN)

// Database
const db = new Low(new JSONFile('db.json'))

async function initDB() {
  await db.read()
  db.data ||= { users: {} }
}

// Rolling email system
function getNextEmail(user) {
  if (!user.emails || user.emails.length === 0) return null

  user.lastIndex = (user.lastIndex || 0) % user.emails.length
  const email = user.emails[user.lastIndex]
  user.lastIndex++
  return email
}

// Templates
const templates = {
  login: `Dear WhatsApp Support Team,

I hope this message finds you well.

I am writing to kindly request assistance with my WhatsApp account. I am currently unable to log in and receive the message “cannot log in at this time”.

Below are my account details:
• Email          : {email}
• Phone Number   : {number}

I would greatly appreciate it if you could help me resolve this login issue so I can regain access to my account as soon as possible.

Thank you very much for your time and support. I look forward to your assistance.`,

  restricted: `Dear WhatsApp Support Team,

I hope you are doing well.

I am reaching out to appeal the restriction on my WhatsApp account. When I try to use the app, I see the message “Your account is restricted right now.”

Here are my account details:
• Email          : {email}
• Phone Number   : {number}

I believe this may have been a mistake or I may have unintentionally violated a policy. I would really appreciate it if you could review my account and help lift the restriction so I can continue using WhatsApp normally.

Thank you for your understanding and for taking the time to assist me. I am looking forward to your positive response.`
}

// Temporary state
const userState = {}

// Start
bot.start(async (ctx) => {
  await initDB()

  ctx.reply(
    'Main Menu:',
    Markup.keyboard([
      ['➕ Add Email'],
      ['📋 View Emails'],
      ['📝 Generate Message']
    ]).resize()
  )
})

// Add Email
bot.hears('➕ Add Email', (ctx) => {
  userState[ctx.from.id] = 'awaiting_email'
  ctx.reply('Please enter your email:')
})

// View Emails
bot.hears('📋 View Emails', async (ctx) => {
  await initDB()

  const user = db.data.users[ctx.from.id]

  if (!user || user.emails.length === 0) {
    return ctx.reply('No emails saved ❌')
  }

  ctx.reply('Your emails:\n\n' + user.emails.join('\n'))
})

// Generate Message
bot.hears('📝 Generate Message', (ctx) => {
  userState[ctx.from.id] = 'choose_template'

  ctx.reply(
    'Select issue type:',
    Markup.keyboard([
      ['Login Issue'],
      ['Account Restricted']
    ]).resize()
  )
})

// Handle template selection
bot.hears(['Login Issue', 'Account Restricted'], (ctx) => {
  const type = ctx.message.text === 'Login Issue' ? 'login' : 'restricted'

  userState[ctx.from.id] = { step: 'awaiting_number', type }

  ctx.reply('Enter phone number:')
})

// Handle all text input
bot.on('text', async (ctx) => {
  await initDB()

  const state = userState[ctx.from.id]

  if (!state) return

  const id = ctx.from.id

  // Save email
  if (state === 'awaiting_email') {
    db.data.users[id] ||= { emails: [] }

    db.data.users[id].emails.push(ctx.message.text)
    await db.write()

    userState[id] = null

    return ctx.reply('Email added successfully ✅')
  }

  // Generate message
  if (state.step === 'awaiting_number') {
    const user = db.data.users[id]

    if (!user || user.emails.length === 0) {
      userState[id] = null
      return ctx.reply('Please add email first ❌')
    }

    const number = ctx.message.text
    const email = getNextEmail(user)

    let message = templates[state.type]
      .replace('{email}', email)
      .replace('{number}', number)

    await db.write()

    userState[id] = null

    return ctx.reply(message)
  }
})

bot.launch()
