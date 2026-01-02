# QR-based restaurant ordering system for Tilda

## 1) Коротка інструкція
1. Створіть Zero Block або HTML-блок у Tilda й відкрийте HTML-редактор.
2. Скопіюйте **весь код** із розділу «Готовий код» та вставте його в редактор.
3. Токен і chat_id уже підставлені (можете змінити при потребі в блоці JS: `BOT_TOKEN`, `CHAT_ID`).
4. Кожна позиція має поле `img` з посиланням на фото з naciku-delivery.com — за потреби замініть його на точний URL зі сторінки страви.
5. Опублікуйте сторінку. Параметр `?table=1..10` у URL автоматично підтягне номер столу (або сауни); гість також може ввести/змінити номер у кошику.
6. Питання про номер столу/сауни та спосіб подачі страв з’являються **лише в кошику** під час оформлення. Кошик, коментар і вибір подачі зберігаються в LocalStorage, щоб можна було дозамовити пізніше.

## 2) Повністю готовий код (HTML + CSS + JS)
```html
<div class="entry-modal" id="entry-modal">
  <div class="entry-card">
    <div class="entry-title">Замовлення без офіціанта</div>
    <p class="entry-text">Ми додали зручність: одразу відкривайте категорії, додавайте страви й напої, залишайте побажання — замовлення стартує ще до приходу офіціанта.</p>
    <button id="entry-close" class="checkout-btn" type="button" data-link="https://naciku-bukovel.com.ua/menu">Почати замовлення</button>
  </div>
</div>

<div class="menu-app">
  <header class="menu-header">
    <div class="brand">
      <div class="brand-kicker">New Year Light</div>
      <div class="brand-title">Naciku Restaurant</div>
      <div class="brand-sub">Самостійне замовлення без офіціанта — одразу при вході</div>
    </div>
    <div class="cart-icon" id="cart-toggle">
      <span class="dot"></span>
      Кошик <span id="cart-count">0</span>
    </div>
  </header>

  <section class="welcome" id="welcome-banner">
    <div>
      <strong>Новий рік без очікування:</strong> обирайте категорії, додавайте страви й напої, лишайте коментар — усе самостійно.
    </div>
    <button id="close-welcome">Зрозуміло</button>
  </section>

  <section class="notice">Номер столу/сауни та порядок подачі вказуєте в кошику. Можна дозамовляти в будь-який час — без очікування офіціанта.</section>

  <section class="menu" id="menu"></section>

  <section class="comment-block">
    <label for="order-comment">Коментар до замовлення</label>
    <textarea id="order-comment" placeholder="гостро / без цибулі / без сметани / побажання"></textarea>
  </section>

  <button class="checkout-btn" id="checkout-btn">Переглянути кошик</button>

  <!-- Tilda form (опціонально). Поля заповнюються скриптом перед відправкою. -->
  <form id="tilda-form" style="display:none;">
    <input type="hidden" name="table-number" id="form-table" />
    <input type="hidden" name="basket-output" id="form-basket" />
    <input type="hidden" name="total-sum" id="form-total" />
    <input type="hidden" name="comment" id="form-comment" />
    <input type="hidden" name="serving" id="form-serving" />
    <input type="hidden" name="payment-method" id="form-payment" />
    <input type="hidden" name="extra-wishes" id="form-wishes" />
  </form>
</div>

  <button class="cart-floating" id="cart-floating">🛒 <span id="cart-count-floating">0</span></button>
  <button class="waiter-floating" id="waiter-floating">Виклик офіціанта</button>

  <div class="waiter-modal" id="waiter-modal">
  <div class="waiter-card">
    <div class="cart-header">
      <h3>Виклик офіціанта</h3>
      <button class="close" id="close-waiter">×</button>
    </div>
    <p class="entry-text" style="margin-top:6px;">Виберіть зону та вкажіть номер столу/сауни, щоб офіціант знав, куди підійти.</p>
    <div class="waiter-field">
      <label for="waiter-area">Зона обслуговування</label>
      <select id="waiter-area" class="waiter-input">
        <option value="restaurant">Ресторан</option>
        <option value="lounge">Лаундж зона</option>
        <option value="sauna">Сауна</option>
      </select>
    </div>
    <div class="waiter-field">
      <label for="waiter-number-mode">Як обрати номер</label>
      <select id="waiter-number-mode" class="waiter-input">
        <option value="manual" selected>Ввести вручну</option>
        <option value="list">Обрати зі списку</option>
      </select>
    </div>
    <div class="waiter-field waiter-number-list" id="waiter-number-list">
      <label for="waiter-number-select">Номер зі списку</label>
      <select id="waiter-number-select" class="waiter-input"></select>
    </div>
    <div class="waiter-field waiter-number-manual" id="waiter-number-manual">
      <label for="waiter-table">Номер столу / сауни</label>
      <input id="waiter-table" type="text" placeholder="Наприклад, 110 або 115" class="waiter-input" />
    </div>
    <button id="waiter-send" class="checkout-btn" style="margin-top:10px;">Викликати</button>
  </div>
</div>

<div class="photo-modal" id="photo-modal">
  <div class="photo-card">
    <button class="photo-close" id="photo-close">×</button>
    <img id="photo-img" src="" alt="Перегляд страви" />
  </div>
</div>

<!-- Модальне вікно кошика -->
<div class="cart-modal" id="cart-modal">
  <div class="cart-content">
    <div class="cart-header">
      <h3>Ваш кошик</h3>
      <button class="close" id="close-cart">×</button>
    </div>

    <div class="cart-details">
      <div class="field">
        <label for="location-type">Де вас обслуговувати?</label>
        <select id="location-type">
          <option value="table">Стіл у залі</option>
          <option value="sauna">Сауна</option>
        </select>
      </div>
      <div class="field">
        <label for="location-number-mode">Як обрати номер</label>
        <select id="location-number-mode">
          <option value="manual" selected>Ввести вручну</option>
          <option value="list">Обрати зі списку</option>
        </select>
      </div>
      <div class="field location-number-list" id="location-number-list">
        <label for="location-number-select">Номер зі списку</label>
        <select id="location-number-select"></select>
      </div>
      <div class="field location-number-manual" id="location-number-manual">
        <label for="table-input" id="location-label">Номер столу</label>
        <input id="table-input" type="text" placeholder="Наприклад, 110 або 115" />
      </div>
      <div class="field">
        <label for="serving-order">Подача страв</label>
        <select id="serving-order">
          <option value="all">Подати все разом</option>
          <option value="courses">Подати по черзі (спершу перші страви, потім гарячі, далі десерт)</option>
        </select>
      </div>
      <div class="field">
        <label for="payment-method">Форма оплати</label>
        <select id="payment-method">
          <option value="cash">Готівка</option>
          <option value="card">Карта</option>
        </select>
      </div>
      <div class="field">
        <label for="extra-wishes">Додаткові побажання</label>
        <textarea id="extra-wishes" placeholder="Наприклад, подати тепліше або уточнити час"></textarea>
      </div>
    </div>

    <div class="cart-menu-block">
      <div class="cart-menu-title">Додайте ще позиції</div>
      <div id="cart-menu-categories"></div>
    </div>

    <div id="cart-items"></div>
    <div class="cart-summary">
      <div>
        <div class="muted">Подача: <span id="serving-summary"></span></div>
        <div>Разом: <span id="cart-total">0 грн</span></div>
      </div>
      <button class="checkout-btn" id="checkout-btn-modal">Оформити</button>
    </div>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700&display=swap');
:root {
  --accent: #d18b1f;
  --accent-2: #bcd7f3;
  --bg: radial-gradient(circle at 10% 10%, rgba(255,229,188,0.6), transparent 35%),
        radial-gradient(circle at 90% 0, rgba(188,215,243,0.4), transparent 38%),
        linear-gradient(180deg, #fff7ec 0%, #f6efe5 50%, #fefcf7 100%);
  --snow: radial-gradient(circle, rgba(255,255,255,0.6) 0, rgba(255,255,255,0) 55%);
  --text: #242631;
  --muted: #6d7382;
  --card: rgba(255,255,255,0.9);
  --stroke: rgba(0,0,0,0.06);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); position: relative; }
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: var(--snow), var(--snow), var(--snow);
  background-size: 220px 220px, 280px 280px, 340px 340px;
  background-position: 0 0, 45% 10%, 85% 25%;
  pointer-events: none;
  opacity: 0.6;
  animation: snowfall 22s linear infinite;
  z-index: 0;
}
.entry-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center; z-index: 20; padding: 18px; }
.entry-card { background: linear-gradient(140deg, rgba(255,255,255,0.96), rgba(255,239,214,0.96)); border: 1px solid var(--stroke); border-radius: 18px; padding: 18px; max-width: 520px; box-shadow: 0 20px 50px rgba(0,0,0,0.16); }
.entry-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #a16500; }
.entry-text { color: var(--muted); margin: 0 0 14px; line-height: 1.5; }
.menu-app { max-width: 1140px; margin: 0 auto; padding: 24px 16px 140px; position: relative; z-index: 1; }
.menu-header { display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(255,255,255,0.94); padding: 18px 20px; z-index: 2; border-radius: 18px; border: 1px solid var(--stroke); box-shadow: 0 16px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.75); backdrop-filter: blur(14px); }
.brand-kicker { color: var(--muted); font-size: 12px; letter-spacing: 1.4px; text-transform: uppercase; }
.brand-title { font-weight: 800; font-size: 24px; letter-spacing: 0.6px; font-family: 'Playfair Display', serif; }
.brand-sub { color: var(--muted); font-size: 13px; }
.dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; display: inline-block; box-shadow: 0 0 0 4px rgba(209,139,31,0.25); }
.cart-icon { cursor: pointer; font-weight: 700; background: linear-gradient(120deg, rgba(209,139,31,0.14), rgba(188,215,243,0.22)); border: 1px solid var(--stroke); padding: 12px 16px; border-radius: 14px; box-shadow: 0 10px 28px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 10px; color: var(--text); }
.notice { margin: 12px 0; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,0.92); border: 1px solid var(--stroke); font-weight: 600; box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 30px rgba(0,0,0,0.07); }
.welcome { margin: 16px 0; padding: 16px; border-radius: 16px; background: linear-gradient(135deg, rgba(255,229,188,0.75), rgba(188,215,243,0.3)); display: flex; gap: 12px; align-items: center; justify-content: space-between; border: 1px solid var(--stroke); box-shadow: 0 18px 45px rgba(0,0,0,0.12); }
#welcome-banner button { background: var(--accent); color: #0d0e12; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer; font-weight: 800; box-shadow: 0 10px 26px rgba(209,139,31,0.35); }
.menu { display: grid; gap: 14px; }
.category { background: var(--card); border-radius: 18px; padding: 12px; box-shadow: 0 16px 36px rgba(0,0,0,0.08); border: 1px solid var(--stroke); }
.category-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(188,215,243,0.32)); border: 1px solid var(--stroke); border-radius: 14px; padding: 14px; cursor: pointer; font-weight: 800; font-size: 16px; color: var(--text); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); }
.cat-left { display: flex; align-items: center; gap: 10px; }
.pill { background: rgba(209,139,31,0.14); color: #a16500; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 12px; border: 1px solid rgba(209,139,31,0.25); }
.chevron { font-size: 18px; color: var(--muted); }
.items { display: grid; gap: 12px; margin-top: 12px; }
.item { display: grid; grid-template-columns: 100px 1fr auto; gap: 12px; align-items: center; padding: 12px; border: 1px solid var(--stroke); border-radius: 16px; background: linear-gradient(120deg, rgba(255,255,255,0.95), rgba(255,240,213,0.9)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 28px rgba(0,0,0,0.08); }
.item-photo { width: 100px; height: 100px; border-radius: 14px; background-size: cover; background-position: center; background-color: #f4f0ea; border: 1px solid var(--stroke); box-shadow: 0 8px 20px rgba(0,0,0,0.12); cursor: zoom-in; transition: transform 0.15s ease, box-shadow 0.2s ease; }
.item-photo:hover { transform: scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
.item-main { display: grid; gap: 6px; }
.item-title { font-weight: 800; letter-spacing: 0.2px; font-family: 'Playfair Display', serif; }
.item-desc { color: var(--muted); font-size: 14px; line-height: 1.35; }
.item-actions { display: grid; gap: 8px; justify-items: end; }
.item-price { font-weight: 800; color: #a16500; }
.add-btn { background: linear-gradient(120deg, #ffd188, #ffecbe); color: #5b3200; border: none; padding: 10px 12px; border-radius: 12px; cursor: pointer; font-weight: 800; transition: transform 0.1s ease, box-shadow 0.2s; box-shadow: 0 12px 24px rgba(209,139,31,0.22); }
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(209,139,31,0.3); }
.comment-block { margin: 20px 0; display: grid; gap: 8px; background: var(--card); padding: 12px; border-radius: 14px; box-shadow: 0 14px 32px rgba(0,0,0,0.08); border: 1px solid var(--stroke); }
.comment-block textarea { width: 100%; min-height: 90px; border: 1px solid var(--stroke); background: rgba(255,255,255,0.8); color: var(--text); border-radius: 12px; padding: 10px; resize: vertical; }
.checkout-btn { width: 100%; padding: 16px; background: linear-gradient(120deg, #ffd188, #ffeac3); color: #5b3200; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 16px 32px rgba(209,139,31,0.28); }
.cart-floating { position: fixed; left: 16px; bottom: 16px; padding: 12px 14px; background: rgba(255,255,255,0.95); border: 1px solid var(--stroke); border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.16); font-weight: 800; cursor: pointer; z-index: 12; display: flex; align-items: center; gap: 8px; color: var(--text); backdrop-filter: blur(10px); }
.waiter-floating { position: fixed; left: 16px; bottom: 70px; padding: 14px 16px; background: linear-gradient(120deg, #ffe6b0, #ffd188); border: 1px solid var(--stroke); border-radius: 14px; box-shadow: 0 14px 28px rgba(0,0,0,0.18); font-weight: 900; cursor: pointer; z-index: 12; color: #5b3200; backdrop-filter: blur(10px); letter-spacing: 0.2px; }
.cart-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: none; align-items: flex-end; justify-content: center; z-index: 10; padding: 12px; }
.cart-content { background: rgba(255,255,255,0.96); width: 100%; max-width: 620px; border-radius: 18px 18px 0 0; padding: 18px; max-height: 88vh; overflow: auto; box-shadow: 0 -10px 36px rgba(0,0,0,0.15); border: 1px solid var(--stroke); backdrop-filter: blur(6px); }
.cart-header { display: flex; align-items: center; justify-content: space-between; }
.cart-header h3 { margin: 0; font-family: 'Playfair Display', serif; letter-spacing: 0.3px; }
.close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--muted); }
.cart-details { display: grid; gap: 10px; margin: 10px 0; background: rgba(255,255,255,0.82); padding: 12px; border-radius: 14px; border: 1px solid var(--stroke); backdrop-filter: blur(6px); }
.field label { display: block; font-weight: 700; margin-bottom: 4px; }
.field input, .field select, .field textarea { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--stroke); background: rgba(255,255,255,0.9); color: var(--text); }
.field textarea { min-height: 70px; resize: vertical; }
.location-number-list, .waiter-number-list { display: none; }
.cart-menu-block { margin: 12px 0; background: rgba(255,255,255,0.86); border: 1px solid var(--stroke); border-radius: 14px; padding: 12px; }
.cart-menu-title { font-weight: 800; margin-bottom: 8px; }
.cart-accordion { border: 1px solid var(--stroke); border-radius: 12px; margin-bottom: 8px; overflow: hidden; background: rgba(255,255,255,0.92); box-shadow: 0 6px 14px rgba(0,0,0,0.06); }
.cart-accordion button { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px; background: transparent; border: none; font-weight: 700; cursor: pointer; color: var(--text); }
.cart-accordion .chevron { color: var(--muted); }
.cart-accordion .items { padding: 10px 12px; background: rgba(255,255,255,0.86); }
.cart-accordion .item { grid-template-columns: 70px 1fr auto; padding: 10px; }
.cart-accordion .item-photo { width: 70px; height: 70px; }
.cart-item { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--stroke); }
.cart-item strong { display: block; font-family: 'Playfair Display', serif; }
.qty-controls { display: flex; align-items: center; gap: 8px; }
.qty-controls button { width: 30px; height: 30px; border-radius: 10px; border: 1px solid var(--stroke); background: rgba(255,255,255,0.9); cursor: pointer; font-weight: 700; color: var(--text); }
.remove { background: none; border: none; color: var(--muted); cursor: pointer; }
.cart-summary { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; gap: 12px; }
.muted { color: var(--muted); font-size: 12px; }
.waiter-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: none; align-items: center; justify-content: center; z-index: 14; padding: 14px; }
.waiter-card { background: rgba(255,255,255,0.96); border: 1px solid var(--stroke); border-radius: 18px; padding: 16px; max-width: 420px; width: 100%; box-shadow: 0 18px 42px rgba(0,0,0,0.18); }
.waiter-field { display: grid; gap: 6px; margin-top: 8px; }
.waiter-field label { font-weight: 700; color: var(--text); }
.waiter-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--stroke); background: rgba(255,255,255,0.9); color: var(--text); margin-top: 6px; }
.photo-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 30; padding: 18px; }
.photo-modal.show { display: flex; }
.photo-card { background: #fff; padding: 10px; border-radius: 14px; box-shadow: 0 18px 36px rgba(0,0,0,0.22); max-width: 90vw; max-height: 90vh; display: grid; gap: 8px; }
.photo-card img { max-width: 80vw; max-height: 80vh; border-radius: 12px; object-fit: cover; }
.photo-close { justify-self: end; background: none; border: none; font-size: 22px; cursor: pointer; color: #333; }
@media (min-width: 720px) { .items { grid-template-columns: repeat(2, 1fr); } }
@keyframes snowfall { from { background-position: 0 0, 45% 10%, 85% 25%; } to { background-position: 0 620px, 45% 520px, 85% 580px; } }
</style></style>

<!-- JS логіка -->
<script>
const BOT_TOKEN = '8423983712:AAHv0z7YIg3OQr_HqYJcXG8p2w4SQVY6mSI';
const CHAT_ID = '7260212555';
const STORAGE_KEY = 'naciku_cart_v3';
const MAX_DISCOUNT_RATE = 0.20;
const defaultImg = 'https://static.tildacdn.one/tild3938-3661-4366-b161-386664313133/ChatGPT_Image_27__20.png';
const images = {
  'Сніданок мандрівника': 'https://static.tildacdn.one/tild3938-3661-4366-b161-386664313133/ChatGPT_Image_27__20.png',
  'Великий сніданок': 'https://static.tildacdn.one/tild3865-6362-4637-b532-613166396363/ChatGPT_Image_30__20.png',
  'Шакшука': 'https://static.tildacdn.one/tild3136-3165-4533-b437-336231363662/ChatGPT_Image_27__20.png',
  'Пашот': 'https://static.tildacdn.one/tild6337-6264-4565-a361-663663633161/ChatGPT_Image_30__20.png',
  'Сирники': 'https://static.tildacdn.one/tild3030-6561-4434-b133-326631373966/ChatGPT_Image_31__20.png',
  'Вівсянка': 'https://static.tildacdn.one/tild3066-3838-4461-b832-616535346437/ChatGPT_Image_30__20.png',
  '4 сири': 'https://static.tildacdn.one/tild3834-6638-4339-a563-383562363830/ChatGPT_Image_30__20.png',
  'М’ясна': 'https://static.tildacdn.one/tild3038-3539-4565-b264-366330613338/ChatGPT_Image_30__20.png',
  'Фірмова Де ля Каса': 'https://static.tildacdn.one/tild3664-6566-4661-b833-383236313333/ChatGPT_Image_30__20.png',
  'Капричоза': 'https://static.tildacdn.one/tild6262-3530-4136-a164-373661363632/ChatGPT_Image_30__20.png',
  'Пепероні': 'https://static.tildacdn.one/tild6566-3637-4134-b636-343334393634/ChatGPT_Image_30__20.png',
  'Баварська': 'https://static.tildacdn.one/tild3163-3762-4661-b866-336562626334/ChatGPT_Image_30__20.png',
  'Цезар': 'https://static.tildacdn.one/tild3435-3431-4833-b364-656232336261/ChatGPT_Image_30__20.png',
  'Маргарита': 'https://static.tildacdn.one/tild3632-3930-4339-b065-666431393737/ChatGPT_Image_30__20.png',
  'Бограч': 'https://static.tildacdn.one/tild6133-3139-4339-b731-376637373464/ChatGPT_Image_30__20.png',
  'Борщ': 'https://static.tildacdn.one/tild6239-3533-4065-b438-643463653537/ChatGPT_Image_30__20.png',
  'Грибна юшка': 'https://static.tildacdn.one/tild3666-3534-4139-b039-353436323432/ChatGPT_Image_30__20.png',
  'Бульйон з птиці': 'https://static.tildacdn.one/tild3535-3939-4337-b539-303564616530/ChatGPT_Image_30__20.png',
  'Чікен бургер': 'https://static.tildacdn.one/tild3866-3264-4261-a633-643632363433/ChatGPT_Image_30__20.png',
  'Чікен-нагетс бургер': 'https://static.tildacdn.one/tild6365-3433-4439-b639-373636346637/ChatGPT_Image_30__20.png',
  'Бургер зі свининою': 'https://static.tildacdn.one/tild3539-3262-4164-a566-376138643862/ChatGPT_Image_30__20.png',
  'Лаваш курячий': 'https://static.tildacdn.one/tild3433-3936-4033-b665-303237393966/ChatGPT_Image_30__20.png',
  'Грінки з сиром та часником': 'https://static.tildacdn.one/tild3034-3935-4261-a435-633433616535/ChatGPT_Image_30__20.png',
  'Сирні палички': 'https://static.tildacdn.one/tild3266-3633-4330-b239-303266613833/ChatGPT_Image_30__20.png',
  'Картопляні кульки': 'https://static.tildacdn.one/tild3832-3732-4236-a362-343265646465/ChatGPT_Image_30__20.png',
  'Шаурма бокс соковитий вибух': 'https://static.tildacdn.one/tild3338-3864-4765-b239-623637663238/photo_51997664873788.jpg',
  'Шаурма бокс 4-сира': 'https://static.tildacdn.one/tild6338-3064-4536-b037-663066353337/photo_51997664873788.jpg',
  'Шаурма бокс з яловичиною': 'https://static.tildacdn.one/tild3431-3338-4161-b632-646536373162/photo_51997664873788.jpg',
  'М’ясна нарізка': 'https://static.tildacdn.one/tild3330-3464-4131-b234-396436306434/ChatGPT_Image_30__20.png',
  'Сирне плато': 'https://static.tildacdn.one/tild6466-6234-4338-b838-303039656138/ChatGPT_Image_30__20.png',
  'Овочева нарізка': 'https://static.tildacdn.one/tild3362-3837-4961-b261-393337336136/ChatGPT_Image_30__20.png',
  'Оселедець власного посолу': 'https://static.tildacdn.one/tild3664-6663-4535-b565-633633306130/ChatGPT_Image_30__20.png',
  'Сало власного виробництва': 'https://static.tildacdn.one/tild3236-6365-4333-b237-666530326638/ChatGPT_Image_30__20.png',
  'Маринади домашні': 'https://static.tildacdn.one/tild3362-6234-4364-b665-326438666264/ChatGPT_Image_31__20.png',
  'Домашні маринади': 'https://static.tildacdn.one/tild3362-6234-4364-b665-326438666264/ChatGPT_Image_31__20.png',
  'Карбонара': 'https://static.tildacdn.one/tild3134-3436-4362-b463-646231376266/ChatGPT_Image_30__20.png',
  'Альфредо': 'https://static.tildacdn.one/tild3566-3461-4164-a435-333639626336/ChatGPT_Image_30__20.png',
  'Аматричана': 'https://static.tildacdn.one/tild6263-3463-4663-b430-656362333964/ChatGPT_Image_30__20.png',
  'Болоньєзе': 'https://static.tildacdn.one/tild3266-6535-4438-b035-313265623336/photo_51997664873788.jpg',
  'Паста з креветками': 'https://static.tildacdn.one/tild3862-6138-4166-a436-646466656434/photo_51997664873788.jpg',
  'Куряча пательня з картоплею та грибами': 'https://static.tildacdn.one/tild3631-3734-4963-b231-636238613861/ChatGPT_Image_30__20.png',
  'Пательня по-карпатськи': 'https://static.tildacdn.one/tild3464-3735-4537-b838-356166626364/ChatGPT_Image_30__20.png',
  'Цезар з куркою': 'https://static.tildacdn.one/tild6363-3634-4334-b632-346435643836/ChatGPT_Image_31__20.png',
  'Цезар з креветками': 'https://static.tildacdn.one/tild3965-3137-4133-b433-633639356262/ChatGPT_Image_31__20.png',
  'Грецький': 'https://static.tildacdn.one/tild3533-6637-4961-a638-313434316430/ChatGPT_Image_31__20.png',
  'Теплий салат з овочами': 'https://static.tildacdn.one/tild3132-3934-4435-b761-663933333833/ChatGPT_Image_31__20.png',
  'Капуста по-домашньому': 'https://static.tildacdn.one/tild3962-6535-4666-b963-613833323966/photo_51997664873788.jpg',
  'Стейк зі свинини': 'https://static.tildacdn.one/tild3735-3539-4731-b130-613639663065/ChatGPT_Image_31__20.png',
  'Стейк курячий': 'https://static.tildacdn.one/tild3638-3338-4465-b638-323932373931/ChatGPT_Image_31__20.png',
  'Ковбаски курячі (2 шт.)': 'https://static.tildacdn.one/tild6439-6363-4862-a266-323436346563/ChatGPT_Image_31__20.png',
  'Ковбаски свинні (2 шт.)': 'https://static.tildacdn.one/tild3962-3930-4330-b963-653637663462/ChatGPT_Image_31__20.png',
  'Курячі крильця в соусі «Теріякі»': 'https://static.tildacdn.one/tild6433-6163-4262-b862-353664666434/ChatGPT_Image_31__20.png',
  'Свинні ребра в медовому соусі': 'https://static.tildacdn.one/tild3065-6433-4333-b165-323465336661/ChatGPT_Image_31__20.png',
  'Шашлик зі свинини (1 кг)': 'https://static.tildacdn.one/tild3235-3162-4665-a535-613866356636/ChatGPT_Image_31__20.png',
  'Шашлик курячий (1 кг)': 'https://static.tildacdn.one/tild6138-3964-4235-b430-323532303131/ChatGPT_Image_31__20.png',
  'Деруни (4 шт.)': 'https://static.tildacdn.one/tild3730-6366-4133-b337-646537306230/ChatGPT_Image_31__20.png',
  'Банош': 'https://static.tildacdn.one/tild3961-3732-4561-b336-656431386664/ChatGPT_Image_31__20.png',
  'Вареники з картоплею (8 шт.)': 'https://static.tildacdn.one/tild6662-3836-4339-b961-393863666535/ChatGPT_Image_31__20.png',
  'Пельмені (16 шт.)': 'https://static.tildacdn.one/tild3131-6539-4337-b566-393763623337/ChatGPT_Image_31__20.png',
  'Форель у вершковому соусі': 'https://static.tildacdn.one/tild3436-6338-4236-b933-636336323633/ChatGPT_Image_31__20.png',
  'Картопляне пюре': 'https://static.tildacdn.one/tild3438-3139-4334-b837-353936313764/ChatGPT_Image_31__20.png',
  'Картопля по-домашньому': 'https://static.tildacdn.one/tild3832-6139-4439-a634-643664383832/ChatGPT_Image_31__20.png',
  'Овочі гриль': 'https://static.tildacdn.one/tild6330-3130-4234-a565-363037636636/ChatGPT_Image_31__20.png',
  'Гречка з грибами та цибулею': 'https://static.tildacdn.one/tild3461-6633-4164-b364-323761613332/ChatGPT_Image_31__20.png',
  'Запечена картопля': 'https://static.tildacdn.one/tild3635-6264-4634-a261-666439653434/ChatGPT_Image_31__20.png',
  'Картопля фрі': 'https://static.tildacdn.one/tild3763-6333-4938-b933-326637366164/ChatGPT_Image_31__20.png',
  'Курячі нагетси': 'https://static.tildacdn.one/tild6532-3562-4231-b634-376566656461/ChatGPT_Image_31__20.png',
  'Бульйон курячий': 'https://static.tildacdn.one/tild3535-3939-4337-b539-303564616530/ChatGPT_Image_30__20.png',
  'Картопляне пюре з курячими котлетками': 'https://static.tildacdn.one/tild6364-6562-4636-b036-306261623238/ChatGPT_Image_31__20.png',
  'Салат «Мізерія»': 'https://static.tildacdn.one/tild3534-3863-4637-b662-373938353637/ChatGPT_Image_31__20.png',
  'Coca-Cola 0.33': 'https://static.tildacdn.one/tild6637-6130-4165-a538-346162396538/image_processing2025.webp',
  'Fanta 0.33': 'https://static.tildacdn.one/tild6163-6437-4865-a634-303036353033/image_processing2024.webp',
  'Sprite 0.33': 'https://static.tildacdn.one/tild6131-3830-4564-b265-303162633931/image_processing2024.webp',
  'Сік в асортименті 0.250': 'https://static.tildacdn.one/tild3935-3930-4466-b437-376366636131/360_F_76182742_TgwoZ.jpg',
  'Газована вода 0.33': 'https://static.tildacdn.one/tild3264-3132-4965-b861-346463356130/ChatGPT_Image_1__202.png',
  'Не газована 0.33': 'https://static.tildacdn.one/tild3264-3132-4965-b861-346463356130/ChatGPT_Image_1__202.png',
  'Боржомі 0.5': 'https://static.tildacdn.one/tild3266-3262-4338-b263-653438653134/image_processing2024.webp',
  'Еспресо': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Espresso_coffee.jpg',
  'Допіо': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Doppio.jpg',
  'Американо': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Americano_Coffee_(16608533770).jpg',
  'Американо з молоком': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Coffee_with_milk_(563800).jpg',
  'Капучино': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cappuccino.jpg',
  'Латте': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Latte_macchiato_with_coffee_beans.jpg',
  'Чайник чаю в асортимені': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Tea_pot.svg',
  'kronenbourg blanc': defaultImg,
  'IPA': defaultImg,
  'Jameson': 'https://static.tildacdn.one/tild6562-3538-4232-b537-643133316636/image_processing2025.webp',
  'Ballantines': 'https://static.tildacdn.one/tild3366-6362-4330-b362-623963313239/image_processing2024.webp',
  "Jack Daniel’s": 'https://static.tildacdn.one/tild3338-3763-4232-a233-393264633065/image_processing2025.webp',
  'Jim Beam': 'https://static.tildacdn.one/tild3935-3063-4433-a264-326536316536/image_processing2025.webp',
  'Monkey Shoulder': 'https://static.tildacdn.one/tild3439-3338-4638-b135-336636373132/image_processing2025.webp',
  'Oakheart': 'https://static.tildacdn.one/tild3437-6566-4639-b630-353732613231/image_processing2025.webp',
  'Old Kakheti': 'https://static.tildacdn.one/tild3131-3532-4431-a563-666164343239/image_processing2025.webp',
  'Закарпатський': 'https://static.tildacdn.one/tild3931-6130-4633-b365-363061333238/image_processing2025.webp',
  'Hennessy': 'https://static.tildacdn.one/tild6464-6134-4234-b834-643161366436/image_processing2024.webp',
  'Absolut': 'https://static.tildacdn.one/tild3237-6165-4361-b962-343331366530/image_processing2025.webp',
  'Nemiroff Delikat': 'https://static.tildacdn.one/tild3164-3763-4231-b435-366537393465/image_processing2024.webp',
  'Nemiroff Lex': 'https://static.tildacdn.one/tild6563-3664-4162-a232-373434366630/301146686.webp',
  'Finlandia': 'https://static.tildacdn.one/tild3565-3339-4463-b364-666364356461/image_processing2024.webp',
  'Koskenkorva': 'https://static.tildacdn.one/tild3931-3861-4738-b464-303063373061/image_processing2025.webp',
  'Карпатський самогон': 'https://static.tildacdn.one/tild3939-6263-4763-b732-303739396665/ChatGPT_Image_31__20.png',
  'Beefeater': 'https://static.tildacdn.one/tild3664-6136-4131-b233-393836303331/image_processing2025.webp',
  'Olmeca silver': 'https://static.tildacdn.one/tild3733-3033-4833-b764-306166306331/image_processing2024.webp',
  'Olmeca gold': 'https://static.tildacdn.one/tild3832-6131-4932-a635-343339346162/image_processing2024.webp',
  'Jagermeister': 'https://static.tildacdn.one/tild6235-3535-4930-b337-653863373235/image_processing2024.webp',
  'Sambuca': 'https://static.tildacdn.one/tild3336-3866-4763-b963-336362613738/image_processing2024.webp',
  'Baileys': 'https://static.tildacdn.one/tild6537-6530-4930-b035-343732393734/image_processing2024.webp'
};
const menuData = [
  { category: 'Сніданки', icon: '☀️', items: [
      { name: 'Сніданок мандрівника', desc: 'Омлет із сирною та м’ясною нарізкою, овочами', price: 300, img: images['Сніданок мандрівника'] },
      { name: 'Великий сніданок', desc: 'Яєчня, сирна та м’ясна нарізка, овочі', price: 300, img: images['Великий сніданок'] },
      { name: 'Шакшука', desc: 'Яйця у томатно-овочевому соусі', price: 250, img: images['Шакшука'] },
      { name: 'Пашот', desc: 'Яйце пашот з листям салату та тостом', price: 250, img: images['Пашот'] },
      { name: 'Сирники', desc: '4 шт. із джемом та сметаною', price: 200, img: images['Сирники'] },
      { name: 'Вівсянка', desc: 'Класична вівсянка', price: 200, img: images['Вівсянка'] }
    ]},
  { category: 'Піца', icon: '🍕', items: [
      { name: '4 сири', desc: 'Вершкова основа, моцарела, брі, твердий сир, дорблю', price: 350, img: images['4 сири'] },
      { name: 'М’ясна', desc: 'Томатна основа, салямі, шинка, кабаноси, чорізо', price: 300, img: images['М’ясна'] },
      { name: 'Фірмова Де ля Каса', desc: 'Томатна основа, маслини, чорізо, в’ялені томати', price: 320, img: images['Фірмова Де ля Каса'] },
      { name: 'Капричоза', desc: 'Шинка, маслини, свіжі помідори, гриби', price: 320, img: images['Капричоза'] },
      { name: 'Пепероні', desc: 'Пікантна ковбаса', price: 330, img: images['Пепероні'] },
      { name: 'Баварська', desc: 'Соковиті ковбаски, сир', price: 350, img: images['Баварська'] },
      { name: 'Цезар', desc: 'Соус Цезар, пармезан, курка, бекон, салат', price: 300, img: images['Цезар'] },
      { name: 'Маргарита', desc: 'Томатна основа, моцарела, базилік', price: 250, img: images['Маргарита'] },
      { name: 'Де ля каса 40 см', desc: 'Великий розмір 40 см', price: 350, img: images['Фірмова Де ля Каса'] },
      { name: 'Баварська 40 см', desc: 'Великий розмір 40 см', price: 400, img: images['Баварська'] },
      { name: 'Пепероні 40 см', desc: 'Великий розмір 40 см', price: 360, img: images['Пепероні'] }
    ]},
  { category: 'Перші страви (супи)', icon: '🥣', items: [
      { name: 'Борщ', desc: 'Класичний борщ', price: 250, img: images['Борщ'] },
      { name: 'Бограч', desc: 'Ситний угорський суп', price: 350, img: images['Бограч'] },
      { name: 'Грибна юшка', desc: 'Ніжний грибний суп', price: 300, img: images['Грибна юшка'] },
      { name: 'Бульйон з птиці', desc: 'Легкий курячий бульйон', price: 200, img: images['Бульйон з птиці'] }
    ]},
  { category: 'Холодні закуски', icon: '🥗', items: [
      { name: 'М’ясна нарізка', desc: 'Асорті м’ясної нарізки', price: 250, img: images['М’ясна нарізка'] },
      { name: 'Сирне плато', desc: 'Різні сири', price: 250, img: images['Сирне плато'] },
      { name: 'Овочева нарізка', desc: 'Свіжі овочі', price: 200, img: images['Овочева нарізка'] },
      { name: 'Оселедець власного посолу', desc: 'Фірмовий оселедець', price: 250, img: images['Оселедець власного посолу'] },
      { name: 'Сало власного виробництва', desc: 'Домашнє сало', price: 200, img: images['Сало власного виробництва'] },
      { name: 'Домашні маринади', desc: 'Асорті маринадів', price: 150, img: images['Домашні маринади'] }
    ]},
  { category: 'Паста', icon: '🍝', items: [
      { name: 'Карбонара', desc: 'Класична паста з беконом', price: 250, img: images['Карбонара'] },
      { name: 'Альфредо', desc: 'Вершковий соус', price: 200, img: images['Альфредо'] },
      { name: 'Аматричана', desc: 'Томатний соус, бекон', price: 250, img: images['Аматричана'] },
      { name: 'Болоньєзе', desc: 'М’ясний соус', price: 300, img: images['Болоньєзе'] },
      { name: 'Паста з креветками', desc: 'Креветки, вершковий соус', price: 350, img: images['Паста з креветками'] }
    ]},
  { category: 'Пательні (сковорідки)', icon: '🍳', items: [
      { name: 'Куряча пательня з картоплею та грибами', desc: 'Ситна страва на сковорідці', price: 300, img: images['Куряча пательня з картоплею та грибами'] },
      { name: 'Пательня по-карпатськи', desc: 'Фірмовий мікс з овочами та м’ясом', price: 350, img: images['Пательня по-карпатськи'] }
    ]},
  { category: 'Салати', icon: '🥬', items: [
      { name: 'Цезар з куркою', desc: 'Соус Цезар, пармезан, курка, бекон, салат', price: 300, img: images['Цезар з куркою'] },
      { name: 'Цезар з креветками', desc: 'Соус Цезар, пармезан, креветки', price: 350, img: images['Цезар з креветками'] },
      { name: 'Грецький', desc: 'Овочі, фета, оливки', price: 250, img: images['Грецький'] },
      { name: 'Теплий салат з овочами', desc: 'Запечені овочі та зелень', price: 300, img: images['Теплий салат з овочами'] },
      { name: 'Капуста по-домашньому', desc: 'Домашня капуста', price: 100, img: images['Капуста по-домашньому'] }
    ]},
  { category: 'М’ясні страви', icon: '🥩', items: [
      { name: 'Стейк зі свинини', desc: 'Соковитий стейк зі свинини', price: 500, img: images['Стейк зі свинини'] },
      { name: 'Стейк курячий', desc: 'Ніжний курячий стейк', price: 400, img: images['Стейк курячий'] },
      { name: 'Ковбаски курячі (2 шт.)', desc: 'Соковиті ковбаски', price: 300, img: images['Ковбаски курячі (2 шт.)'] },
      { name: 'Ковбаски свинні (2 шт.)', desc: 'Пікантні ковбаски', price: 350, img: images['Ковбаски свинні (2 шт.)'] },
      { name: 'Курячі крильця в соусі «Теріякі»', desc: 'Крильця в соусі Теріякі', price: 300, img: images['Курячі крильця в соусі «Теріякі»'] },
      { name: 'Свинні ребра в медовому соусі', desc: 'Запечені ребра', price: 450, img: images['Свинні ребра в медовому соусі'] },
      { name: 'Шашлик зі свинини (1 кг)', desc: 'Ситний шашлик', price: 1000, img: images['Шашлик зі свинини (1 кг)'] },
      { name: 'Шашлик курячий (1 кг)', desc: 'Шашлик із курки', price: 900, img: images['Шашлик курячий (1 кг)'] }
    ]},
  { category: 'Карпатські страви', icon: '🏔️', items: [
      { name: 'Деруни (4 шт.)', desc: 'Картопляні деруни', price: 250, img: images['Деруни (4 шт.)'] },
      { name: 'Банош', desc: 'Кукурудзяна каша з бринзою', price: 300, img: images['Банош'] },
      { name: 'Вареники з картоплею (8 шт.)', desc: 'Картопляні вареники', price: 250, img: images['Вареники з картоплею (8 шт.)'] },
      { name: 'Пельмені (16 шт.)', desc: 'Домашні пельмені', price: 250, img: images['Пельмені (16 шт.)'] },
      { name: 'Форель у вершковому соусі', desc: 'Риба у вершковому соусі', price: 450, img: images['Форель у вершковому соусі'] },
      { name: 'Домашні маринади', desc: 'Асорті маринадів', price: 150, img: images['Домашні маринади'] }
    ]},
  { category: 'Гарніри', icon: '🍠', items: [
      { name: 'Картопляне пюре', desc: 'Ніжне пюре', price: 200, img: images['Картопляне пюре'] },
      { name: 'Картопля по-домашньому', desc: 'Запечена картопля по-домашньому', price: 250, img: images['Картопля по-домашньому'] },
      { name: 'Овочі гриль', desc: 'Овочі на грилі', price: 300, img: images['Овочі гриль'] },
      { name: 'Гречка з грибами та цибулею', desc: 'Гречка з додатками', price: 200, img: images['Гречка з грибами та цибулею'] },
      { name: 'Запечена картопля', desc: 'Печена картопля', price: 250, img: images['Запечена картопля'] }
    ]},
  { category: 'Дитяче меню', icon: '🧒', items: [
      { name: 'Картопля фрі', desc: 'Хрустка картопля фрі', price: 100, img: images['Картопля фрі'] },
      { name: 'Курячі нагетси', desc: 'Соковиті нагетси', price: 150, img: images['Курячі нагетси'] },
      { name: 'Бульйон курячий', desc: 'Легкий курячий бульйон', price: 100, img: images['Бульйон курячий'] },
      { name: 'Картопляне пюре з курячими котлетками', desc: 'Домашні котлетки з пюре', price: 170, img: images['Картопляне пюре з курячими котлетками'] },
      { name: 'Салат «Мізерія»', desc: 'Легкий салат', price: 100, img: images['Салат «Мізерія»'] }
    ]},
  { category: 'Бар (напої)', icon: '🥤', items: [
      // Безалкогольні
      { name: 'Coca-Cola 0.33', desc: 'Охолоджений напій', price: 100, img: images['Coca-Cola 0.33'] },
      { name: 'Fanta 0.33', desc: 'Охолоджений напій', price: 100, img: images['Fanta 0.33'] },
      { name: 'Sprite 0.33', desc: 'Охолоджений напій', price: 100, img: images['Sprite 0.33'] },
      { name: 'Сік в асортименті 0.250', desc: 'Різні смаки', price: 80, img: images['Сік в асортименті 0.250'] },
      { name: 'Газована вода 0.33', desc: 'Сильногазована вода', price: 100, img: images['Газована вода 0.33'] },
      { name: 'Не газована 0.33', desc: 'Тиха вода', price: 50, img: images['Не газована 0.33'] },
      { name: 'Боржомі 0.5', desc: 'Мінеральна вода', price: 200, img: images['Боржомі 0.5'] },
      // Гарячі напої
      { name: 'Еспресо', desc: 'Класична порція', price: 70, img: images['Еспресо'] },
      { name: 'Допіо', desc: 'Подвійний еспресо', price: 100, img: images['Допіо'] },
      { name: 'Американо', desc: 'Чорна кава', price: 80, img: images['Американо'] },
      { name: 'Американо з молоком', desc: 'З додаванням молока', price: 100, img: images['Американо з молоком'] },
      { name: 'Капучино', desc: 'Кава з молочною піною', price: 120, img: images['Капучино'] },
      { name: 'Латте', desc: 'Молочний шот з еспресо', price: 150, img: images['Латте'] },
      { name: 'Чайник чаю в асортимені', desc: 'Зелений, чорний або трав’яний', price: 100, img: images['Чайник чаю в асортимені'] },
      // Пиво
      { name: 'kronenbourg blanc', desc: 'Світле нефільтроване', price: 100, img: images['kronenbourg blanc'] },
      { name: 'IPA', desc: 'Хмелеве ароматне пиво', price: 180, img: images['IPA'] },
      // Віскі та ром
      { name: 'Jameson', desc: 'Віскі, 50 мл', price: 175, img: images['Jameson'] },
      { name: 'Ballantines', desc: 'Віскі, 50 мл', price: 80, img: images['Ballantines'] },
      { name: 'Jack Daniel’s', desc: 'Віскі, 50 мл', price: 95, img: images['Jack Daniel’s'] },
      { name: 'Jim Beam', desc: 'Віскі, 50 мл', price: 125, img: images['Jim Beam'] },
      { name: 'Monkey Shoulder', desc: 'Віскі, 50 мл', price: 220, img: images['Monkey Shoulder'] },
      { name: 'Oakheart', desc: 'Ром, 50 мл', price: 100, img: images['Oakheart'] },
      // Коньяки та бренді
      { name: 'Old Kakheti', desc: 'Коньяк, 50 мл', price: 70, img: images['Old Kakheti'] },
      { name: 'Закарпатський', desc: 'Коньяк, 50 мл', price: 70, img: images['Закарпатський'] },
      { name: 'Hennessy', desc: 'Коньяк, 50 мл', price: 250, img: images['Hennessy'] },
      // Горілка
      { name: 'Absolut', desc: 'Горілка, 50 мл', price: 80, img: images['Absolut'] },
      { name: 'Nemiroff Delikat', desc: 'Горілка, 50 мл', price: 50, img: images['Nemiroff Delikat'] },
      { name: 'Nemiroff Lex', desc: 'Горілка, 50 мл', price: 80, img: images['Nemiroff Lex'] },
      { name: 'Finlandia', desc: 'Горілка, 50 мл', price: 100, img: images['Finlandia'] },
      { name: 'Koskenkorva', desc: 'Горілка, 50 мл', price: 100, img: images['Koskenkorva'] },
      { name: 'Карпатський самогон', desc: 'Домашня настоянка, 50 мл', price: 50, img: images['Карпатський самогон'] },
      // Текіла та джин
      { name: 'Beefeater', desc: 'Джин, 50 мл', price: 140, img: images['Beefeater'] },
      { name: 'Olmeca silver', desc: 'Текіла, 50 мл', price: 150, img: images['Olmeca silver'] },
      { name: 'Olmeca gold', desc: 'Текіла, 50 мл', price: 180, img: images['Olmeca gold'] },
      // Лікери
      { name: 'Jagermeister', desc: 'Трав’яний лікер, 50 мл', price: 100, img: images['Jagermeister'] },
      { name: 'Sambuca', desc: 'Анісовий лікер, 50 мл', price: 80, img: images['Sambuca'] },
      { name: 'Baileys', desc: 'Вершковий лікер, 50 мл', price: 100, img: images['Baileys'] }
    ]}
];

const upsellItems = ['Боржомі 0.5','Coca-Cola 0.33','Еспресо','Jameson'];

const menuEl = document.getElementById('menu');
const cartModal = document.getElementById('cart-modal');
const cartItemsEl = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartCountFloating = document.getElementById('cart-count-floating');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const cartFloating = document.getElementById('cart-floating');
const closeCart = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutBtnModal = document.getElementById('checkout-btn-modal');
const orderCommentEl = document.getElementById('order-comment');
const servingSelect = document.getElementById('serving-order');
const servingSummary = document.getElementById('serving-summary');
const welcomeBanner = document.getElementById('welcome-banner');
const closeWelcome = document.getElementById('close-welcome');
const entryModal = document.getElementById('entry-modal');
const entryClose = document.getElementById('entry-close');
const waiterBtn = document.getElementById('waiter-floating');
const waiterModal = document.getElementById('waiter-modal');
const closeWaiter = document.getElementById('close-waiter');
const waiterArea = document.getElementById('waiter-area');
const waiterNumberMode = document.getElementById('waiter-number-mode');
const waiterNumberSelect = document.getElementById('waiter-number-select');
const waiterNumberList = document.getElementById('waiter-number-list');
const waiterNumberManual = document.getElementById('waiter-number-manual');
const waiterTable = document.getElementById('waiter-table');
const waiterSend = document.getElementById('waiter-send');
const locationSelect = document.getElementById('location-type');
const locationLabel = document.getElementById('location-label');
const locationNumberMode = document.getElementById('location-number-mode');
const locationNumberSelect = document.getElementById('location-number-select');
const locationNumberList = document.getElementById('location-number-list');
const locationNumberManual = document.getElementById('location-number-manual');
const tableInput = document.getElementById('table-input');
const cartMenuCategories = document.getElementById('cart-menu-categories');
const paymentMethod = document.getElementById('payment-method');
const extraWishes = document.getElementById('extra-wishes');
const photoModal = document.getElementById('photo-modal');
const photoImg = document.getElementById('photo-img');
const photoClose = document.getElementById('photo-close');

const formTable = document.getElementById('form-table');
const formBasket = document.getElementById('form-basket');
const formTotal = document.getElementById('form-total');
const formComment = document.getElementById('form-comment');
const formServing = document.getElementById('form-serving');
const formPayment = document.getElementById('form-payment');
const formWishes = document.getElementById('form-wishes');

let cart = [];
let appliedDiscount = 0;

function resetDiscount() {
  appliedDiscount = 0;
}

function getCartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getFinalTotal() {
  return Math.max(0, getCartTotal() - appliedDiscount);
}
function getStoredState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    cart,
    comment: orderCommentEl.value,
    locationType: locationSelect.value,
    locationNumberMode: locationNumberMode.value,
    locationNumberSelect: locationNumberSelect.value,
    locationNumber: tableInput.value,
    serving: servingSelect.value,
    paymentMethod: paymentMethod.value,
    extraWishes: extraWishes.value
  }));
}

function getTableFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('table');
}

const numberOptions = [
  ...Array.from({ length: 20 }, (_, i) => `${i + 1}`),
  ...Array.from({ length: 21 }, (_, i) => `${100 + i}`)
];

function populateNumberSelect(selectEl) {
  selectEl.innerHTML = numberOptions.map(num => `<option value="${num}">${num}</option>`).join('');
}

function getLocationNumber() {
  return locationNumberMode.value === 'list'
    ? locationNumberSelect.value.trim()
    : tableInput.value.trim();
}

function getWaiterNumber() {
  return waiterNumberMode.value === 'list'
    ? waiterNumberSelect.value.trim()
    : waiterTable.value.trim();
}

function toggleNumberMode() {
  const useList = locationNumberMode.value === 'list';
  locationNumberList.style.display = useList ? 'block' : 'none';
  locationNumberManual.style.display = useList ? 'none' : 'block';
}

function toggleWaiterNumberMode() {
  const useList = waiterNumberMode.value === 'list';
  waiterNumberList.style.display = useList ? 'block' : 'none';
  waiterNumberManual.style.display = useList ? 'none' : 'block';
}

function toggleCategory(el) {
  const items = el.querySelector('.items');
  const chev = el.querySelector('.chevron');
  const isOpen = items.style.display === 'grid';
  items.style.display = isOpen ? 'none' : 'grid';
  chev.textContent = isOpen ? '+' : '−';
}

function openPhotoModal(url) {
  photoImg.src = url || defaultImg;
  photoModal.classList.add('show');
}

function closePhotoModal() {
  photoImg.src = '';
  photoModal.classList.remove('show');
}

function attachPhotoClicks(scope) {
  scope.querySelectorAll('.item-photo').forEach(ph => {
    const img = ph.dataset.img;
    ph.addEventListener('click', () => openPhotoModal(img));
  });
}

function renderMenu() {
  menuEl.innerHTML = menuData.map(cat => `
    <div class="category">
      <button class="category-toggle" type="button">
        <div class="cat-left"><span>${cat.icon || ''}</span><span class="category-name">${cat.category}</span></div>
        <div class="cat-right"><span class="pill">${cat.items.length}</span><span class="chevron">+</span></div>
      </button>
      <div class="items" style="display:none;">
        ${cat.items.map(item => `
            <div class="item">
              <div class="item-photo" data-img="${item.img || defaultImg}" style="background-image:url('${item.img || defaultImg}')"></div>
            <div class="item-main">
              <div class="item-title">${item.name}</div>
              <div class="item-desc">${item.desc}</div>
            </div>
            <div class="item-actions">
              <div class="item-price">${item.price} грн</div>
              <button class="add-btn" data-name="${item.name}" data-price="${item.price}">Додати</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  menuEl.querySelectorAll('.category-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleCategory(btn.closest('.category')));
  });
    menuEl.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.name, Number(btn.dataset.price)));
    });
    attachPhotoClicks(menuEl);
  }

function renderCartCategories() {
  cartMenuCategories.innerHTML = menuData.map(cat => `
    <div class="cart-accordion">
      <button type="button">
        <span>${cat.icon || ''} ${cat.category}</span>
        <span class="chevron">+</span>
      </button>
      <div class="items" style="display:none;">
        ${cat.items.map(item => `
          <div class="item">
            <div class="item-photo" data-img="${item.img || defaultImg}" style="background-image:url('${item.img || defaultImg}')"></div>
            <div class="item-main">
              <div class="item-title">${item.name}</div>
              <div class="item-desc">${item.price} грн</div>
            </div>
            <div class="item-actions">
              <button class="add-btn" data-name="${item.name}" data-price="${item.price}">Додати</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  cartMenuCategories.querySelectorAll('.cart-accordion > button').forEach(btn => {
    btn.addEventListener('click', e => {
      const parent = btn.closest('.cart-accordion');
      const items = parent.querySelector('.items');
      const chev = btn.querySelector('.chevron');
      const isOpen = items.style.display === 'block';
      items.style.display = isOpen ? 'none' : 'block';
      chev.textContent = isOpen ? '+' : '−';
    });
  });
    cartMenuCategories.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.name, Number(btn.dataset.price)));
    });
    attachPhotoClicks(cartMenuCategories);
  }

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty += 1; else cart.push({ name, price, qty: 1 });
  resetDiscount();
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = count;
  cartCountFloating.textContent = count;
  cartItemsEl.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <span class="item-desc">${item.price} грн × ${item.qty}</span>
      </div>
      <div class="qty-controls">
        <button data-action="dec" data-name="${item.name}">−</button>
        <span>${item.qty}</span>
        <button data-action="inc" data-name="${item.name}">+</button>
        <button class="remove" data-action="remove" data-name="${item.name}">✕</button>
      </div>
    </div>
  `).join('') : '<p>Кошик порожній</p>';

  const total = getCartTotal();
  const finalTotal = getFinalTotal();
  cartTotal.textContent = appliedDiscount ? `${finalTotal.toFixed(2)} грн (знижка -${appliedDiscount.toFixed(2)} грн)` : `${total} грн`;
  servingSummary.textContent = servingSelect.options[servingSelect.selectedIndex].textContent;

  cartItemsEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const action = btn.dataset.action;
      if (action === 'inc') changeQty(name, 1);
      if (action === 'dec') changeQty(name, -1);
      if (action === 'remove') removeItem(name);
    });
  });
  persistState();
}

function changeQty(name, delta) {
  cart = cart.map(i => i.name === name ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
  resetDiscount();
  updateCartUI();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  resetDiscount();
  updateCartUI();
}

function toggleCart(open) {
  cartModal.style.display = open ? 'flex' : 'none';
  if (open) cartModal.scrollTop = 0;
}

function toggleWaiter(open) {
  waiterModal.style.display = open ? 'flex' : 'none';
  if (open) {
    waiterArea.value = locationSelect.value === 'sauna' ? 'sauna' : 'restaurant';
    waiterNumberMode.value = locationNumberMode.value;
    waiterTable.value = tableInput.value || '';
    waiterNumberSelect.value = locationNumberSelect.value;
    toggleWaiterNumberMode();
    (waiterNumberMode.value === 'list' ? waiterNumberSelect : waiterTable).focus();
  }
}

async function sendToTelegram(payload) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: payload, parse_mode: 'HTML' })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram error ${res.status}: ${body}`);
  }
  return res.json();
}

function buildMessage() {
  const numberValue = getLocationNumber();
  const locationText = locationSelect.value === 'sauna' ? `Сауна ${numberValue || 'не вказано'}` : `Стіл ${numberValue || 'не вказано'}`;
  const comment = orderCommentEl.value.trim() || 'без коментаря';
  const serving = servingSelect.value === 'all' ? 'Подати все разом' : 'Подача по черзі';
  const payment = paymentMethod.value === 'card' ? 'Карта' : 'Готівка';
  const wishes = extraWishes.value.trim() || 'без побажань';
  const date = new Date();
  const list = cart.map(i => `• <b>${i.name}</b> — ${i.qty} × ${i.price} = ${i.qty * i.price} грн`).join('\n');
  const total = getCartTotal();
  const finalTotal = getFinalTotal();
  const discountLine = appliedDiscount ? `\nЗнижка (гра): -${appliedDiscount.toFixed(2)} грн` : '';
  const payableLine = appliedDiscount ? `\nДо оплати: <b>${finalTotal.toFixed(2)} грн</b>` : '';
  const dateLine = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  return `Локація: <b>${locationText}</b>\n${list || ''}\nРазом: <b>${total} грн</b>${discountLine}${payableLine}\nПодача: ${serving}\nОплата: ${payment}\nПобажання: ${wishes}\nКоментар: ${comment}\n${dateLine}`;
}

function fillFormFields() {
  const numberValue = getLocationNumber();
  const locationText = locationSelect.value === 'sauna' ? `Сауна ${numberValue || 'не вказано'}` : `Стіл ${numberValue || 'не вказано'}`;
  formTable.value = locationText;
  formBasket.value = cart.map(i => `${i.name} — ${i.qty} шт`).join(', ');
  formTotal.value = getFinalTotal();
  formComment.value = orderCommentEl.value.trim();
  formServing.value = servingSelect.options[servingSelect.selectedIndex].textContent;
  formPayment.value = paymentMethod.value;
  formWishes.value = extraWishes.value.trim();
}

async function handleWaiterCall() {
  const area = waiterArea.value || 'restaurant';
  const areaLabel = area === 'sauna' ? 'Сауна' : area === 'lounge' ? 'Лаундж зона' : 'Ресторан';
  const target = getWaiterNumber() || getLocationNumber();
  if (!target) { alert('Вкажіть номер столу або сауни.'); return; }
  try {
    await sendToTelegram(`Виклик офіціанта: ${areaLabel} — номер ${target}`);
    alert('Офіціант уже в дорозі.');
    toggleWaiter(false);
  } catch (e) {
    console.error('Waiter call failed', e);
    alert('Не вдалося викликати офіціанта. Перевірте з’єднання.');
  }
}

function confirmDrinkOffer() {
  const hasDrink = cart.some(i => upsellItems.includes(i.name));
  if (hasDrink) return true;
  const wantsDrink = confirm('Можливо, бажаєте замовити напої? Натисніть «ОК» для так або «Скасувати» для ні.');
  if (wantsDrink) {
    alert('Додайте напій у категорії «Бар», після чого знову натисніть «Оформити».');
    return false;
  }
  return true;
}

function updateLocationLabel() {
  locationLabel.textContent = locationSelect.value === 'sauna' ? 'Номер сауни' : 'Номер столу';
  toggleNumberMode();
}

function runMathChallenge(total) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const start = Date.now();
  const answer = prompt(`Математична гра (6 секунд): ${a} + ${b} = ?\nПравильна відповідь — випадкова знижка до 20%.`);
  if (answer === null) { alert('Гру пропущено — замовлення без знижки.'); return 0; }
  const elapsed = Date.now() - start;
  if (elapsed > 6000) { alert('Час вийшов — замовлення без знижки.'); return 0; }
  if (Number(answer.trim()) === a + b) {
    const randomRate = (Math.floor(Math.random() * (MAX_DISCOUNT_RATE * 100)) + 1) / 100;
    const discount = +(total * randomRate).toFixed(2);
    alert(`Вітаємо! Знижка ${Math.round(randomRate * 100)}% застосована: -${discount} грн`);
    return discount;
  }
  alert('Невірна відповідь — замовлення без знижки.');
  return 0;
}

async function handleCheckout() {
  if (!cart.length) { alert('Додайте страви до кошика.'); return; }
  if (!getLocationNumber()) { alert('Вкажіть номер столу або сауни.'); return; }
  if (!confirmDrinkOffer()) { return; }
  const totalBeforeDiscount = getCartTotal();
  appliedDiscount = 0;
  appliedDiscount = runMathChallenge(totalBeforeDiscount);
  updateCartUI();
  fillFormFields();
  const message = buildMessage();
  try {
    await sendToTelegram(message);
    alert('Замовлення відправлено! Можете дозамовляти у будь-який момент.');
    cart = [];
    appliedDiscount = 0;
    updateCartUI();
    toggleCart(false);
  } catch (e) {
    console.error('Telegram send failed', e);
    alert('Помилка відправки. Перевірте токен/мережу. Деталі в консолі: ' + (e?.message || e));
  }
}

function hydrateFromStorage() {
  const saved = getStoredState();
  if (saved.cart) cart = saved.cart;
  if (saved.comment) orderCommentEl.value = saved.comment;
  if (saved.locationType) locationSelect.value = saved.locationType;
  if (saved.locationNumberMode) locationNumberMode.value = saved.locationNumberMode;
  if (saved.locationNumberSelect) locationNumberSelect.value = saved.locationNumberSelect;
  if (saved.locationNumber) tableInput.value = saved.locationNumber;
  if (saved.serving) servingSelect.value = saved.serving;
  if (saved.paymentMethod) paymentMethod.value = saved.paymentMethod;
  if (saved.extraWishes) extraWishes.value = saved.extraWishes;
  updateLocationLabel();
}

function initLocation() {
  const urlTable = getTableFromUrl();
  populateNumberSelect(locationNumberSelect);
  if (urlTable && !tableInput.value) {
    locationNumberMode.value = 'manual';
    tableInput.value = urlTable;
  }
  toggleNumberMode();
  tableInput.addEventListener('input', () => {
    locationNumberMode.value = 'manual';
    toggleNumberMode();
    persistState();
  });
  locationNumberSelect.addEventListener('change', () => {
    locationNumberMode.value = 'list';
    toggleNumberMode();
    persistState();
  });
  locationNumberMode.addEventListener('change', () => { toggleNumberMode(); persistState(); });
  locationSelect.addEventListener('change', () => { updateLocationLabel(); persistState(); });
}

function initWelcome() {
  closeWelcome.addEventListener('click', () => welcomeBanner.style.display = 'none');
}

function initEntryModal() {
  const hide = () => entryModal.style.display = 'none';
  entryClose.addEventListener('click', () => {
    hide();
  });
  entryModal.addEventListener('click', e => { if (e.target === entryModal) hide(); });
}

function initPhotos() {
  photoClose.addEventListener('click', closePhotoModal);
  photoModal.addEventListener('click', e => { if (e.target === photoModal) closePhotoModal(); });
}

function initWaiter() {
  const hide = () => toggleWaiter(false);
  populateNumberSelect(waiterNumberSelect);
  toggleWaiterNumberMode();
  waiterNumberMode.addEventListener('change', toggleWaiterNumberMode);
  waiterNumberSelect.addEventListener('change', () => {
    if (waiterNumberMode.value === 'list') waiterTable.value = '';
  });
  waiterBtn.addEventListener('click', () => toggleWaiter(true));
  closeWaiter.addEventListener('click', hide);
  waiterModal.addEventListener('click', e => { if (e.target === waiterModal) hide(); });
  waiterSend.addEventListener('click', handleWaiterCall);
}

function init() {
  hydrateFromStorage();
  initLocation();
  renderMenu();
  renderCartCategories();
  updateCartUI();
  initWelcome();
  initEntryModal();
  initPhotos();
  initWaiter();
  cartToggle.addEventListener('click', () => toggleCart(true));
  cartFloating.addEventListener('click', () => toggleCart(true));
  closeCart.addEventListener('click', () => toggleCart(false));
  cartModal.addEventListener('click', e => { if (e.target === cartModal) toggleCart(false); });
  checkoutBtn.addEventListener('click', () => toggleCart(true));
  checkoutBtnModal.addEventListener('click', handleCheckout);
  servingSelect.addEventListener('change', () => { updateCartUI(); persistState(); });
  orderCommentEl.addEventListener('input', persistState);
  paymentMethod.addEventListener('change', persistState);
  extraWishes.addEventListener('input', persistState);
}

init();
</script>
```

## 3) Приклад правильного Telegram-повідомлення
```
Локація: Сауна 2
• Борщ — 2 × 250 = 500 грн
• Шашлик зі свинини (1 кг) — 1 × 1000 = 1000 грн
• Червоне вино (келих) — 2 × 180 = 360 грн
Разом: 1860 грн
Подача: Подати все разом
Оплата: Карта
Побажання: подати гарячим
Коментар: без цибулі, напій окремо
12.03.2024 19:45:10
```

## 4) Посилання для QR-кодів (10 столів)
```
https://yourdomain.com/order?table=1
https://yourdomain.com/order?table=2
https://yourdomain.com/order?table=3
https://yourdomain.com/order?table=4
https://yourdomain.com/order?table=5
https://yourdomain.com/order?table=6
https://yourdomain.com/order?table=7
https://yourdomain.com/order?table=8
https://yourdomain.com/order?table=9
https://yourdomain.com/order?table=10
```

## 5) Куди вставляти код у Тільді
- Створіть Zero Block (або HTML-блок) на потрібній сторінці Tilda.
- Відкрийте HTML-редактор блоку й вставте код із розділу «Готовий код» цілком (HTML + CSS + JS).
- Опублікуйте сторінку. Після сканування QR з параметром `?table=N` номер столу або сауни підтягнеться автоматично; уточнення про локацію та подачу гість вводить у кошику під час оформлення.

### Налаштування Telegram та Webhook
1. Токен: вже підставлено у `BOT_TOKEN` (8423983712:AAHv0z7YIg3OQr_HqYJcXG8p2w4SQVY6mSI). Chat ID: вже підставлено у `CHAT_ID` (7260212555, можете замінити за потреби).
2. Обов’язково напишіть боту будь-яке повідомлення або натисніть /start із цього CHAT_ID, інакше Telegram не дозволить відправку.
3. Якщо потрібен офіційний webhook, виконайте `https://api.telegram.org/botTOKEN/setWebhook?url=YOUR_HTTPS_ENDPOINT` (не обов’язково — запит надсилається напряму через fetch).
4. Якщо повідомлення не доходять, відкрийте консоль браузера (F12) й повторіть «Оформити» — помилки Telegram відображаються з кодом і текстом відповіді API.

### QR-коди
- Згенеруйте QR на URL із потрібним `?table=...` (див. перелік вище).
- Розмістіть наклейки на столах або у сауні; при відкритті сторінки параметр підтягне номер.

### Передача даних у форму Tilda
- При натисканні «Оформити» у кошику скрипт заповнює приховані поля `table-number`, `basket-output`, `total-sum`, `comment`, `serving` у формі `#tilda-form`. За потреби підключіть стандартну відправку форми Tilda чи інтеграції (CRM, пошта).
```
