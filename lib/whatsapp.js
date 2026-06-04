const twilio = require('twilio')

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM // whatsapp:+14155238886

async function sendWhatsApp(toPhone, message) {
  // toPhone should be like +919876543210
  const to = 'whatsapp:' + toPhone

  const msg = await client.messages.create({
    from: FROM,
    to,
    body: message
  })

  console.log('WhatsApp sent:', msg.sid, '->', to)
  return msg.sid
}

function confirmationMessage(appt) {
  const date = new Date(appt.appointment_time)
  const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })

  return `👋 Hi ${appt.customer_name},

Your appointment with *Vansh Chauhan* is confirmed!

📅 *Date:* ${dateStr}
⏰ *Time:* ${timeStr}${appt.note ? `\n📝 *Note:* ${appt.note}` : ''}

If you need to reschedule, just reply to this message.

— Vansh Chauhan`
}

function reminderMessage(appt) {
  const date = new Date(appt.appointment_time)
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
  return `⏰ *Reminder from Vansh Chauhan*

Hi ${appt.customer_name}! Your appointment is coming up in less than 1 hour.

⏰ *Time:* ${timeStr}${appt.note ? `\n📝 *Note:* ${appt.note}` : ''}

See you soon!`
}

module.exports = { sendWhatsApp, confirmationMessage, reminderMessage }
