const { Telegraf, Markup } = require('telegraf')
const { Low, JSONFile } = require('lowdb')

const bot = new Telegraf(process.env.BOT_TOKEN)

const db = new Low(new JSONFile('db.json'))

async function initDB() {
  await db.read()
  db.data ||= { users: {} }
}

// ambil email rolling
function getNextEmail(user) {
  if (!user.emails || user.emails.length === 0) return null

  user.lastIndex = (user.lastIndex || 0) % user.emails.length
  const email = user.emails[user.lastIndex]
  user.lastIndex++
  return email
}

// TEMPLATE
const templates = {
  login: `Dear WhatsApp Support Team,

I hope this message finds you well.

I am writing to kindly request assistance with my WhatsApp account. I am currently unable to log in and receive the message “cannot log in at this time”.

Below are my account details:
• Email          : {email}
• Phone Number   : {nomor}

I would greatly appreciate it if you could help me resolve this login issue so I can regain access to my account as soon as possible.

Thank you very much for your time and support. I look forward to your assistance.`,

  restricted: `Dear WhatsApp Support Team,

I hope you are doing well.

I am reaching out to appeal the restriction on my WhatsApp account. When I try to use the app, I see the message “Your account is restricted right now.”

Here are my account details:
• Email          : {email}
• Phone Number   : {nomor}

I believe this may have been a mistake or I may have unintentionally violated a policy. I would really appreciate it if you could review my account and help lift the restriction so I can continue using WhatsApp normally.

Thank you for your understanding and for taking the time to assist me. I am looking forward to your positive response.`
}

// START
bot.start((ctx) => {
  ctx.reply(
    'MENU:',
    Markup.keyboard([
      ['📧 Tambah Email'],
      ['📋 Lihat Email'],
      ['📝 Buat Pesan']
    ]).resize()
  )
})

// TAMBAH EMAIL
bot.hears('📧 Tambah Email', (ctx) => {
  ctx.reply('Masukkan email:')

  bot.once('text', async (ctx2) => {
    await initDB()

    const id = ctx2.from.id
    db.data.users[id] ||= { emails: [] }

    db.data.users[id].emails.push(ctx2.message.text)
    await db.write()

    ctx2.reply('Email ditambahkan ✅')
  })
})

// LIHAT EMAIL
bot.hears('📋 Lihat Email', async (ctx) => {
  await initDB()

  const user = db.data.users[ctx.from.id]
  if (!user || user.emails.length === 0) {
    return ctx.reply('Belum ada email ❌')
  }

  ctx.reply(user.emails.join('\n'))
})

// BUAT PESAN
bot.hears('📝 Buat Pesan', (ctx) => {
  ctx.reply(
    'Pilih:',
    Markup.keyboard([
      ['Login'],
      ['Restricted']
    ]).resize()
  )
})

// LOGIN
bot.hears('Login', async (ctx) => {
  await initDB()

  const user = db.data.users[ctx.from.id]
  if (!user || user.emails.length === 0) {
    return ctx.reply('Tambahkan email dulu ❌')
  }

  ctx.reply('Masukkan nomor:')

  bot.once('text', async (ctx2) => {
    const nomor = ctx2.message.text
    const email = getNextEmail(user)

    let pesan = templates.login
      .replace('{email}', email)
      .replace('{nomor}', nomor)

    await db.write()
    ctx2.reply(pesan)
  })
})

// RESTRICTED
bot.hears('Restricted', async (ctx) => {
  await initDB()

  const user = db.data.users[ctx.from.id]
  if (!user || user.emails.length === 0) {
    return ctx.reply('Tambahkan email dulu ❌')
  }

  ctx.reply('Masukkan nomor:')

  bot.once('text', async (ctx2) => {
    const nomor = ctx2.message.text
    const email = getNextEmail(user)

    let pesan = templates.restricted
      .replace('{email}', email)
      .replace('{nomor}', nomor)

    await db.write()
    ctx2.reply(pesan)
  })
})

bot.launch()
