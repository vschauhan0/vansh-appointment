require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const supabase = require('./lib/supabase')
const { sendWhatsApp, confirmationMessage, reminderMessage } = require('./lib/whatsapp')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// GET /api/appointments — list all
app.get('/api/appointments', async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_time', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/appointments — create + send WhatsApp
app.post('/api/appointments', async (req, res) => {
  const { customer_name, phone, appointment_time, note } = req.body

  if (!customer_name || !phone || !appointment_time) {
    return res.status(400).json({ error: 'Name, phone, and appointment time are required.' })
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ customer_name, phone, appointment_time, note: note || null }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Send WhatsApp confirmation
  try {
    const msg = confirmationMessage(data)
    await sendWhatsApp(phone, msg)
    await supabase.from('appointments').update({ confirmation_sent: true }).eq('id', data.id)
  } catch (err) {
    console.error('WhatsApp send failed:', err.message)
    // Don't fail the whole request — appointment is saved, just log it
  }

  res.status(201).json(data)
})

//DELETE /api/appointments/:id 
app.delete('/api/appointments/:id', async (req, res) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

//POST /api/send-reminders — called by Vercel cron
// Vercel cron hits this endpoint every 5 minutes (configured in vercel.json)
app.post('/api/send-reminders', async (req, res) => {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('reminder_sent', false)
    .gte('appointment_time', now.toISOString())
    .lte('appointment_time', oneHourLater.toISOString())

  if (error) return res.status(500).json({ error: error.message })

  let sent = 0
  for (const appt of appts) {
    try {
      const msg = reminderMessage(appt)
      await sendWhatsApp(appt.phone, msg)
      await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id)
      sent++
    } catch (err) {
      console.error('Reminder failed for', appt.id, err.message)
    }
  }

  res.json({ checked: appts.length, sent })
})

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
