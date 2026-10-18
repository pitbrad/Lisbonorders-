const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const PUBLIC_URL = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL;
const PORT = process.env.PORT || 3000;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_SECRET = crypto.createHash("sha256").update(String(BOT_TOKEN)).digest("hex").slice(0, 32);

const esc = s => String(s ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

async function tg(method, body) {
  const r = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

// Check that the data really comes from Telegram (not forged)
function verifyInitData(initData) {
  const p = new URLSearchParams(initData || "");
  const hash = p.get("hash");
  if (!hash) return null;
  p.delete("hash");
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const calc = crypto.createHmac("sha256", secret).update(check).digest("hex");
  if (calc !== hash) return null;
  if (Date.now() / 1000 - Number(p.get("auth_date")) > 86400) return null;
  try { return JSON.parse(p.get("user")); } catch { return null; }
}

function orderText(o, u) {
  const name = esc([u.first_name, u.last_name].filter(Boolean).join(" "));
  const handle = u.username ? `@${esc(u.username)}` : "no username";
  const items = o.items.map(i => `• ${esc(i.name)} x${Number(i.qty)} (€${Number(i.price) * Number(i.qty)})`).join("\n");
  return [
    "🛒 <b>New order</b>",
    `Customer: <a href="tg://user?id=${u.id}">${name}</a> (${handle})`,
    `User ID: <code>${u.id}</code>`,
    "",
    o.mode === "delivery" ? `🚚 <b>Delivery</b>\nZone: ${esc(o.zone)}\nAddress: ${esc(o.address)}` : "🏪 <b>Pickup</b>",
    "",
    items,
    "",
    `Items: €${Number(o.subtotal)}`,
    `Delivery: €${Number(o.fee)}`,
    `<b>Total: €${Number(o.total)}</b>`,
    `Payment: ${esc(o.payment)}`,
  ].join("\n");
}

const server = http.createServer(async (req, res) => {
  const send = (code, body, type = "text/plain") => { res.writeHead(code, { "Content-Type": type }); res.end(body); };
  let raw = "";
  req.on("data", c => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on("end", async () => {
    try {
      if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
        return send(200, fs.readFileSync(__dirname + "/index.html"), "text/html; charset=utf-8");
      }
      if (req.method === "POST" && req.url === "/order") {
        const { order, initData } = JSON.parse(raw);
        const user = verifyInitData(initData);
        if (!user) return send(401, "Unauthorized");
        if (!order || !Array.isArray(order.items) || !order.items.length) return send(400, "Bad order");
        await tg("sendMessage", { chat_id: ADMIN_ID, text: orderText(order, user), parse_mode: "HTML" });
        return send(200, "ok");
      }
      if (req.method === "POST" && req.url === "/webhook") {
        if (req.headers["x-telegram-bot-api-secret-token"] !== WEBHOOK_SECRET) return send(403, "no");
        const msg = JSON.parse(raw).message;
        if (msg && msg.text && msg.text.startsWith("/start")) {
          await tg("sendMessage", {
            chat_id: msg.chat.id,
            text: "Welcome! Tap the button below to place an order.",
            reply_markup: { inline_keyboard: [[{ text: "🛒 Order now", web_app: { url: PUBLIC_URL } }]] },
          });
        }
        return send(200, "ok");
      }
      send(404, "Not found");
    } catch (e) {
      console.error(e);
      send(500, "Error");
    }
  });
});

server.listen(PORT, async () => {
  console.log("Server running on port", PORT);
  if (!BOT_TOKEN || !ADMIN_ID || !PUBLIC_URL) return console.log("Missing BOT_TOKEN, ADMIN_ID or PUBLIC_URL");
  console.log("Webhook:", (await tg("setWebhook", { url: `${PUBLIC_URL}/webhook`, secret_token: WEBHOOK_SECRET })).ok);
  console.log("Menu button:", (await tg("setChatMenuButton", {
    menu_button: { type: "web_app", text: "Order", web_app: { url: PUBLIC_URL } },
  })).ok);
});
