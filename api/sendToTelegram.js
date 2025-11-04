export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  const data = req.body || {};
  const msg = `🛎 Нове бронювання
👤 Ім’я: ${data.name}
📞 Телефон: ${data.phone}
📅 Заїзд: ${data.checkin}
📅 Виїзд: ${data.checkout}
🏨 Номер: ${data.room}`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg }),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

