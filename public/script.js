const API = '/api'

// Book appointment 
async function book() {
  const name = document.getElementById('name').value.trim()
  const phone = document.getElementById('phone').value.trim()
  const datetime = document.getElementById('datetime').value
  const note = document.getElementById('note').value.trim()

  if (!name) return showAlert('error', 'Please enter your name.')
  if (!phone || phone.length !== 10 || !/^\d+$/.test(phone))
    return showAlert('error', 'Enter a valid 10-digit WhatsApp number.')
  if (!datetime) return showAlert('error', 'Please pick a date and time.')
  if (new Date(datetime) < new Date()) return showAlert('error', 'Please pick a future date and time.')

  const btn = document.getElementById('submitBtn')
  btn.disabled = true
  btn.textContent = 'Booking…'

  try {
    const res = await fetch(API + '/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        phone: '+91' + phone,
        appointment_time: new Date(datetime).toISOString(),
        note: note || null
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Something went wrong.')

    showAlert('success', '✓ Booked! A WhatsApp confirmation was sent to +91' + phone + '.')
    document.getElementById('name').value = ''
    document.getElementById('phone').value = ''
    document.getElementById('datetime').value = ''
    document.getElementById('note').value = ''
    loadAppointments()
  } catch (err) {
    showAlert('error', err.message)
  } finally {
    btn.disabled = false
    btn.textContent = 'Book & send WhatsApp confirmation'
  }
}

//Load & render dashboard
async function loadAppointments() {
  const el = document.getElementById('dashboard')
  el.innerHTML = '<div class="loading">Loading…</div>'

  try {
    const res = await fetch(API + '/appointments')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    renderDashboard(data)
  } catch (err) {
    el.innerHTML = '<div class="loading" style="color:var(--red)">Failed to load: ' + err.message + '</div>'
  }
}

function renderDashboard(list) {
  const el = document.getElementById('dashboard')
  document.getElementById('countBadge').textContent = list.length

  if (list.length === 0) {
    el.innerHTML = '<div class="empty">No appointments yet</div>'
    return
  }

  const now = new Date()
  const oneHour = 60 * 60 * 1000

  const rows = list.map(appt => {
    const apptTime = new Date(appt.appointment_time)
    const diff = apptTime - now
    const isPast = diff < 0
    const isSoon = diff >= 0 && diff <= oneHour

    let tag, cardClass = 'appt-card'
    if (appt.reminder_sent) {
      tag = '<span class="tag tag-reminded">Reminder sent</span>'
    } else if (isPast) {
      tag = '<span class="tag tag-past">Past</span>'
      cardClass += ' past'
    } else if (isSoon) {
      tag = '<span class="tag tag-soon">Within 1 hour</span>'
      cardClass += ' soon'
    } else {
      tag = '<span class="tag tag-upcoming">Upcoming</span>'
    }

    const dateStr = apptTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const timeStr = apptTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    return `
      <div class="${cardClass}">
        <div>
          <div class="appt-name">${esc(appt.customer_name)}</div>
          <div class="appt-phone">${esc(appt.phone)}</div>
          ${appt.note ? `<div class="appt-note">${esc(appt.note)}</div>` : ''}
        </div>
        <div class="appt-right">
          <div class="appt-date">${dateStr}</div>
          <div class="appt-time">${timeStr}</div>
          ${tag}
          <button class="del" onclick="deleteAppt('${appt.id}')" title="Delete">✕</button>
        </div>
      </div>`
  })

  el.innerHTML = `<div class="appt-list">${rows.join('')}</div>`
}

// Delete
async function deleteAppt(id) {
  if (!confirm('Delete this appointment?')) return
  await fetch(API + '/appointments/' + id, { method: 'DELETE' })
  loadAppointments()
}

//Helpers
function showAlert(type, msg) {
  const el = document.getElementById('alert')
  el.className = 'alert ' + type
  el.style.display = 'block'
  el.textContent = msg
  setTimeout(() => el.style.display = 'none', 7000)
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// Init 
const nowMin = new Date()
nowMin.setMinutes(nowMin.getMinutes() - nowMin.getTimezoneOffset())
document.getElementById('datetime').min = nowMin.toISOString().slice(0, 16)

loadAppointments()
setInterval(loadAppointments, 30000)