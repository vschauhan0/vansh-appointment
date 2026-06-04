# Vansh Chauhan — Appointment Booking System

A real-world appointment booking system built for freelancers. Customers book a slot, and they instantly get a WhatsApp confirmation. An automatic reminder is also sent 1 hour before the appointment.

**Live Demo → [vansh-appointments.vercel.app](https://vansh-appointment-spwu.vercel.app/)**

---

## What happens when you book

1. Fill in your name, WhatsApp number, date & time
2. Click **Book & send WhatsApp confirmation**
3. Your appointment is saved to the database instantly
4. You get a real WhatsApp message on your phone confirming the booking
5. 1 hour before your appointment, you get another WhatsApp reminder automatically

---

## To test it yourself

> Before booking, you need to activate WhatsApp once (this is only needed for the sandbox/testing version — real production deployment skips this step)

1. Open WhatsApp on your phone
2. Send this message to **+1 415 523 8886**:
   ```
   join speech-many
   ```
3. You'll get a reply saying you're connected
4. Now go to the live demo and book an appointment with your number
5. You'll receive a WhatsApp message within seconds

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | Supabase (Postgres) |
| WhatsApp | Twilio API |
| Hosting | Vercel |
| Auto reminders | Vercel Cron Jobs (every 5 min) |

---

## Features

- Book appointments with name, phone, date/time and a note
- Real WhatsApp confirmation message sent instantly on booking
- Automatic WhatsApp reminder 1 hour before the appointment
- Live dashboard showing all appointments with status tags
- Appointments marked as — Upcoming, Within 1 hour, Reminder sent, Past
- Delete appointments from the dashboard
- Dashboard auto-refreshes every 30 seconds

---

*Built by Vansh Chauhan*