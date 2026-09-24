# 🚀 راهنمای نصب و استقرار پلتفرم جامع آموزش رادیولوژی (Radiology Education Platform)

این سند شامل راهنمای جامع راه‌اندازی و دپلوی پروژه در محیط‌های مختلف (Local، Docker، Railway، VPS و هاست‌های پایتون) می‌باشد.

---

## 📋 نیازمندی‌های اولیه (Prerequisites)

- **Python**: نسخه 3.10 یا بالاتر
- **Node.js**: نسخه 18 یا بالاتر (برای بیلد پنل مدیریت وب)
- **Telegram Bot Token**: توکن دریافتی از [BotFather@](https://t.me/BotFather)
- **Telegram Admin Numeric ID**: شناسه عددی اکانت تلگرام مدیر (از [userinfobot@](https://t.me/userinfobot))

---

## 🛠️ روش ۱: اجرا در محیط محلی (Local Development)

### ۱. کلون و نصب وابستگی‌های پایتون:
```bash
git clone <repository_url>
cd radiology-education-platform
python3 -m venv venv
source venv/bin/activate  # در ویندوز: venv\Scripts\activate
pip install -r requirements.txt
```

### ۲. بیلد فرانت‌اند پنل وب (در صورت نیاز):
```bash
npm install
npm run build
```

### ۳. ایجاد فایل تنظیمات `.env`:
```bash
cp .env.example .env
```
اطلاعات زیر را در فایل `.env` تنظیم کنید:
```env
BOT_TOKEN=your_bot_token_here
ADMIN_ID=your_telegram_id_here
DATABASE_URL=sqlite+aiosqlite:///./radiology.db
SECRET_KEY=a_very_strong_random_secret_key
IS_INSTALLED=true
```

### ۴. اجرای اجرای پروژه:
```bash
uvicorn app.main:app --reload --port 3000
```
سپس مرورگر خود را باز کرده و به آدرس `http://localhost:3000` یا `http://localhost:3000/docs` مراجعه کنید.

---

## 🐳 روش ۲: استقرار با داکر (Docker & Docker Compose)

پروژه به همراه فایل‌های `Dockerfile` و `docker-compose.yml` آماده دپلوی است.

### اجرا با Docker Compose:
```bash
docker-compose up -d --build
```
این دستور کانتینرهای زیر را اجرا می‌کند:
1. **وب اپلیکیشن و ربات پایتون** (پورت 3000)
2. **دیتابیس MySQL 8.0** (پورت 3306)
3. **سرور Redis** (پورت 6379)

جهت مشاهده لاگ‌های سیستم:
```bash
docker-compose logs -f web
```

---

## ☁️ روش ۳: دپلوی روی Railway یا Render

1. پروژه را به حساب کاربری GitHub خود Push کنید.
2. در داشبورد **Railway** یا **Render** یک پروژه جدید ایجاد کرده و مخزن GitHub را متصل کنید.
3. متغیرهای محیطی زیر را در بخش Environment Variables تعریف کنید:
   - `BOT_TOKEN`
   - `ADMIN_ID`
   - `SECRET_KEY`
   - `IS_INSTALLED=true`
4. پلتفرم به‌طور خودکار `Dockerfile` را شناسایی کرده و بیلد را آغاز می‌کند.

---

## 🖥️ روش ۴: استقرار روی سرور مجازی (Linux VPS)

### ۱. نصب نیازمندی‌های لینوکس (Ubuntu/Debian):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx supervisor -y
```

### ۲. تنظیم سرویس دائم با Supervisor:
فایل `/etc/supervisor/conf.d/radiology.conf` را بسازید:
```ini
[program:radiology_app]
directory=/var/www/radiology
command=/var/www/radiology/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 3000
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/radiology.err.log
stdout_logfile=/var/log/radiology.out.log
```

سپس سرویس را فعال کنید:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start radiology_app
```

---

## 🔐 نکات امنیتی مهم (Security Directives)

1. **حفاظت از کلیدها**: هرگز `BOT_TOKEN` یا `SECRET_KEY` را در سورس‌کد کمیت نکنید.
2. **ماسک‌سازی لاگ‌ها**: تمامی لاگ‌های خطای سیستم به‌صورت خودکار اطلاعات حساس را ماسک می‌کنند.
3. **نسخه پشتیبان ایمن**: بک‌آپ‌گیری از دیتابیس بدون شامل شدن فایل‌های حجیم تلگرام صورت می‌گیرد و پیش از هر بازگردانی، snapshot ایمن برداشته می‌شود.
