const { Telegraf, Markup } = require('telegraf')
const { Low, JSONFile } = require('lowdb')

const bot = new Telegraf(process.env.BOT_TOKEN)

// 🔐 OWNER
const OWNER_ID = 6086899243

const db = new Low(new JSONFile('db.json'))

async function initDB() {
  await db.read()
  db.data ||= { users: {}, whitelist: [OWNER_ID] }
}

// 🔐 ACCESS CHECK
function isAllowed(id) {
  return db.data.whitelist.includes(id)
}

function isOwner(id) {
  return id === OWNER_ID
}

// 🧠 SESSION
const session = {}
function resetSession(id) {
  session[id] = null
}

// 📱 FORMAT
function formatNumber(num) {
  if (num.startsWith('0')) return '+62' + num.slice(1)
  if (!num.startsWith('+')) return '+' + num
  return num
}

// 🔁 EMAIL ENGINE
function getNextEmail(user) {
  user.lastIndex = (user.lastIndex || 0) % user.emails.length
  const email = user.emails[user.lastIndex]

  user.stats ||= { total: 0 }
  user.stats.total++

  user.lastIndex++
  return email
}

// TEMPLATE
const templates = {
  login: `Dear WhatsApp Support Team,

I am unable to log in.

• Email: {email}
• Phone: {number}

Thank you.`,

  restricted: `Dear WhatsApp Support Team,

My account is restricted.

• Email: {email}
• Phone: {number}

Please review.

Thanks.`
}

// MENU
function menu(ctx) {
  return ctx.reply(
    '👑 PANEL',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add Email', 'add')],
      [Markup.button.callback('📋 Emails', 'view')],
      [Markup.button.callback('❌ Delete Email', 'delete')],
      [Markup.button.callback('📝 Generate', 'gen')],
      [Markup.button.callback('👥 Manage Users', 'users')]
    ])
  )
}

// START
bot.start(async (ctx) => {
  await initDB()

  if (!isAllowed(ctx.from.id)) {
    return ctx.reply('Access denied ❌')
  }

  menu(ctx)
})

// 👥 USER MANAGEMENT (OWNER ONLY)
bot.action('users', (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply('Owner only ❌')

  ctx.reply(
    'User Management:',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add User', 'add_user')],
      [Markup.button.callback('📋 List Users', 'list_user')],
      [Markup.button.callback('❌ Remove User', 'remove_user')]
    ])
  )
})

// ADD USER
bot.action('add_user', (ctx) => {
  session[ctx.from.id] = 'add_user'
  ctx.reply('Send user ID:')
})

// LIST USER
bot.action('list_user', async (ctx) => {
  await initDB()
  ctx.reply(db.data.whitelist.join('\n'))
})

// REMOVE USER
bot.action('remove_user', async (ctx) => {
  session[ctx.from.id] = 'remove_user'
  ctx.reply('Send user ID to remove:')
})

// ADD EMAIL
bot.action('add', (ctx) => {
  session[ctx.from.id] = 'add_email'
  ctx.reply('Enter email:')
})

// VIEW EMAIL
bot.action('view', async (ctx) => {
  await initDB()
  const user = db.data.users[ctx.from.id]

  if (!user || user.emails.length === 0) return ctx.reply('No emails')

  ctx.reply(user.emails.join('\n'))
})

// DELETE EMAIL
bot.action('delete', async (ctx) => {
  await initDB()
  const user = db.data.users[ctx.from.id]

  if (!user || user.emails.length === 0) return ctx.reply('No emails')

  session[ctx.from.id] = 'delete_email'

  ctx.reply(user.emails.map((e,i)=>`${i+1}. ${e}`).join('\n')+'\nSend number:')
})

// GENERATE
bot.action('gen', (ctx) => {
  session[ctx.from.id] = 'choose'

  ctx.reply(
    'Select:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Login', 'login')],
      [Markup.button.callback('Restricted', 'restricted')]
    ])
  )
})

bot.action('login', (ctx) => {
  session[ctx.from.id] = { step: 'num', type: 'login' }
  ctx.reply('Enter number:')
})

bot.action('restricted', (ctx) => {
  session[ctx.from.id] = { step: 'num', type: 'restricted' }
  ctx.reply('Enter number:')
})

// TEXT HANDLER
bot.on('text', async (ctx) => {
  await initDB()

  const id = ctx.from.id

  if (!isAllowed(id)) return

  const st = session[id]
  if (!st) return

  // ADD USER
  if (st === 'add_user') {
    const uid = parseInt(ctx.message.text)

    if (!db.data.whitelist.includes(uid)) {
      db.data.whitelist.push(uid)
      await db.write()
    }

    resetSession(id)
    return ctx.reply('User added ✅')
  }

  // REMOVE USER
  if (st === 'remove_user') {
    const uid = parseInt(ctx.message.text)

    db.data.whitelist = db.data.whitelist.filter(u => u !== uid)
    await db.write()

    resetSession(id)
    return ctx.reply('User removed ❌')
  }

  // ADD EMAIL
  if (st === 'add_email') {
    db.data.users[id] ||= { emails: [] }
    db.data.users[id].emails.push(ctx.message.text)

    await db.write()
    resetSession(id)

    return ctx.reply('Saved ✅')
  }

  // DELETE EMAIL
  if (st === 'delete_email') {
    const user = db.data.users[id]
    const i = parseInt(ctx.message.text) - 1

    if (!user || !user.emails[i]) return ctx.reply('Invalid')

    user.emails.splice(i,1)
    await db.write()

    resetSession(id)
    return ctx.reply('Deleted')
  }

  // GENERATE
  if (st.step === 'num') {
    const user = db.data.users[id]

    if (!user || user.emails.length === 0) {
      resetSession(id)
      return ctx.reply('Add email first')
    }

    const number = formatNumber(ctx.message.text)
    const email = getNextEmail(user)

    let msg = templates[st.type]
      .replace('{email}', email)
      .replace('{number}', number)

    await db.write()
    resetSession(id)

    const mailto = `mailto:support@whatsapp.com?body=${encodeURIComponent(msg)}`

    return ctx.reply(msg, {
      ...Markup.inlineKeyboard([
        [Markup.button.url('📧 Send Email', mailto)],
        [Markup.button.callback('🔙 Menu', 'menu')]
      ])
    })
  }
})

bot.action('menu', (ctx) => menu(ctx))

bot.launch()
