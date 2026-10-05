/* ==========================================================
   НАСТРОЙКИ — меняйте только этот блок
   ========================================================== */
const CONFIG = {
  groom: "Алихан",
  bride: "Мээрим",
  monogram: "А & М",

  // Дата и время свадьбы (ISO, +06:00 — Бишкек)
  dateISO: "2027-06-12T16:00:00+06:00",
  durationHours: 8,

  city: "Бишкек",
  venue: "Банкетный зал «Название»",
  address: "г. Бишкек, ул. Примерная, 1",
  mapQuery: "Бишкек, Площадь Ала-Тоо", // что искать на карте
  routeUrl: "", // можно вставить ссылку 2GIS / Google Maps

  rsvpDeadline: "1 мая 2027",

  // Контакты для RSVP (номер БЕЗ + и пробелов, Telegram — без @)
  whatsapp: "996505877785",
  telegram: "bularbekovvv",
  phoneDisplay: "+996 505 877 785",

  // Музыка: файл лежит в папке assets. Если файла нет, кнопка музыки не покажется
  music: "assets/music.mp3",
};

/* ==========================================================
   Код сайта
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wedding = new Date(CONFIG.dateISO);

/* --- Подстановка текстов --- */
const months = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
$("[data-groom]").textContent = CONFIG.groom;
$("[data-bride]").textContent = CONFIG.bride;
$$("[data-monogram]").forEach((e) => (e.textContent = CONFIG.monogram));
$("[data-monogram-footer]").textContent = `${CONFIG.groom} & ${CONFIG.bride}`;
$("[data-date-text]").textContent =
  `${wedding.getDate()} ${months[wedding.getMonth()]} ${wedding.getFullYear()}`;
$("[data-year]").textContent = wedding.getFullYear();
$("[data-city]").textContent = CONFIG.city;
$("[data-venue]").textContent = CONFIG.venue;
$("[data-address]").textContent = CONFIG.address;
$("[data-rsvp-deadline]").textContent = CONFIG.rsvpDeadline;
$("#phoneLink").textContent = CONFIG.phoneDisplay;
$("#phoneLink").href = "tel:" + CONFIG.phoneDisplay.replace(/[^\d+]/g, "");
document.title = `${CONFIG.groom} & ${CONFIG.bride} — приглашение на свадьбу`;

/* --- Карта --- */
const q = encodeURIComponent(CONFIG.mapQuery);
$("#mapFrame").src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
$("#routeLink").href =
  CONFIG.routeUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;

/* --- Персональное обращение: ?guest=Айбек --- */
const guest = new URLSearchParams(location.search).get("guest");
if (guest) {
  $("#guestGreeting").textContent = `Дорогой(ая) ${guest}, мы ждём вас!`;
  $("#fName").value = guest;
}

/* --- Навигация --- */
const nav = $("#nav"),
  links = $("#navLinks");
addEventListener(
  "scroll",
  () => nav.classList.toggle("scrolled", scrollY > 60),
  { passive: true },
);
$("#burger").addEventListener("click", () => links.classList.toggle("open"));
$$("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open")),
);

/* --- Появление при прокрутке --- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 90 + "ms";
  io.observe(el);
});

/* --- Обратный отсчёт --- */
function tick() {
  let diff = Math.max(0, wedding - new Date());
  const d = Math.floor(diff / 864e5);
  diff %= 864e5;
  const h = Math.floor(diff / 36e5);
  diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  $("#cd-days").textContent = d;
  $("#cd-hours").textContent = String(h).padStart(2, "0");
  $("#cd-mins").textContent = String(m).padStart(2, "0");
  $("#cd-secs").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* --- Добавить в календарь (.ics) --- */
$("#addCal").addEventListener("click", () => {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(wedding.getTime() + CONFIG.durationHours * 36e5);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(wedding)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Свадьба ${CONFIG.groom} и ${CONFIG.bride}`,
    `LOCATION:${CONFIG.venue}, ${CONFIG.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "wedding.ics";
  a.click();
});

/* --- RSVP --- */
const form = $("#rsvpForm");
const waBtn = $("#sendWa"),
  tgBtn = $("#sendTg");

function buildText() {
  const name = $("#fName").value.trim();
  const attend = form.attend.value === "yes";
  const lines = [
    `Здравствуйте! Это ${name}.`,
    attend
      ? "Подтверждаю присутствие на свадьбе 🎉"
      : "К сожалению, не смогу присутствовать 😔",
  ];
  if (attend) {
    lines.push(`Количество гостей: ${$("#fCount").value}`);
    const food = $("#fFood").value.trim();
    if (food) lines.push(`Меню/аллергии: ${food}`);
  }
  const wish = $("#fWish").value.trim();
  if (wish) lines.push(`Пожелание: ${wish}`);
  return lines.join("\n");
}

function refreshLinks() {
  waBtn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildText())}`;
  tgBtn.href = `https://t.me/${CONFIG.telegram}`;
}

function valid(e) {
  if ($("#fName").value.trim().length < 2) {
    e.preventDefault();
    $("#formError").textContent = "Пожалуйста, укажите ваше имя и фамилию.";
    $("#fName").focus();
    return false;
  }
  $("#formError").textContent = "";
  return true;
}

function copyText(text) {
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {}
    ta.remove();
  };
  try {
    navigator.clipboard.writeText(text).catch(fallback);
  } catch (_) {
    fallback();
  }
}

form.addEventListener("input", () => {
  $("#moreFields").classList.toggle("hidden", form.attend.value === "no");
  $("#formError").textContent = "";
  $("#formHint").textContent = "";
  refreshLinks();
});
form.addEventListener("submit", (e) => e.preventDefault());
waBtn.addEventListener("click", valid);
tgBtn.addEventListener("click", (e) => {
  if (!valid(e)) return;
  // Telegram не умеет подставлять текст в чат по ссылке, поэтому копируем его
  copyText(buildText());
  $("#formHint").textContent =
    "Текст ответа скопирован. В Telegram вставьте его в чат и отправьте.";
});
refreshLinks();

/* --- Музыка --- */
(function music() {
  if (!CONFIG.music) return;
  const audio = $("#audio"),
    btn = $("#music");
  audio.src = CONFIG.music;
  audio.volume = 0.6;
  let userPaused = false,
    started = false;

  const setUI = (on) => {
    btn.classList.toggle("playing", on);
    btn.classList.toggle("off", !on);
    btn.setAttribute("aria-label", on ? "Выключить музыку" : "Включить музыку");
  };
  const play = () =>
    audio
      .play()
      .then(() => {
        started = true;
        setUI(true);
      })
      .catch(() => setUI(false));

  // Кнопка появляется только если файл найден
  audio.addEventListener(
    "canplay",
    () => {
      btn.hidden = false;
      setUI(!audio.paused);
    },
    { once: true },
  );
  audio.addEventListener("error", () => {
    btn.hidden = true;
  });
  audio.load();

  btn.addEventListener("click", () => {
    if (audio.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      audio.pause();
      setUI(false);
    }
  });

  // Браузеры разрешают звук только после касания: включаем музыку при первом касании страницы
  const first = () => {
    if (!started && !userPaused && !btn.hidden) play();
  };
  ["pointerdown", "touchend", "keydown"].forEach((ev) =>
    window.addEventListener(ev, first, { once: true, passive: true }),
  );

  // Пауза, когда гость свернул вкладку
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (started && !userPaused) audio.play().catch(() => {});
  });
})();

/* --- Падающие лепестки (canvas) --- */
(function petals() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#petals"),
    ctx = c.getContext("2d");
  let W,
    H,
    items = [];
  const colors = ["#f3d9d0", "#ead2c2", "#e2c690", "#d9e0cf"];
  const resize = () => {
    W = c.width = innerWidth;
    H = c.height = innerHeight;
  };
  resize();
  addEventListener("resize", resize);

  const make = (top) => ({
    x: Math.random() * W,
    y: top ? -20 : Math.random() * H,
    r: 4 + Math.random() * 6,
    vy: 0.4 + Math.random() * 0.8,
    vx: -0.3 + Math.random() * 0.6,
    a: Math.random() * 6.28,
    va: (Math.random() - 0.5) * 0.03,
    sway: Math.random() * 6.28,
    col: colors[(Math.random() * colors.length) | 0],
    o: 0.35 + Math.random() * 0.4,
  });
  const count = innerWidth < 700 ? 14 : 28;
  for (let i = 0; i < count; i++) items.push(make(false));

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    items.forEach((p, i) => {
      p.sway += 0.02;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.a += p.va;
      if (p.y > H + 20) items[i] = make(true);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = p.o;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(frame);
  })();
})();
