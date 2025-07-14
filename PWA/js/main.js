// ✅ تعريف المسارات
const routes = {
  home: "partials/home.html",
  orders: "partials/orders.html",
  add: "partials/add.html",
  store: "partials/store.html",
  profile: "partials/profile.html",
};

// ✅ تحميل صفحة ديناميكيًا
async function loadPage(routeName) {
  const container = document.getElementById("app");
  const path = routes[routeName] || routes.home;
  try {
    showLoader();
    const res = await fetch(path);
    if (!res.ok) throw new Error("صفحة غير متوفرة");
    const html = await res.text();
    container.innerHTML = html;
    highlightActiveTab(routeName);
    await loadRouteScript(routeName);
  } catch (err) {
    container.innerHTML = `<div class='error'>⚠️ تعذر تحميل الصفحة</div>`;
    console.error(err);
  } finally {
    hideLoader();
  }
}

// ✅ تحميل سكريبت كل صفحة
async function loadRouteScript(routeName) {
  const oldScript = document.getElementById("route-script");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.id = "route-script";
  script.type = "module";
  script.src = `js/routes/${routeName}.js`;
  document.body.appendChild(script);
}

// ✅ تمييز الزر النشط
function highlightActiveTab(routeName) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  const active = document.querySelector(`[data-route='${routeName}']`);
  if (active) active.classList.add("active");
}

// ✅ التعامل مع أزرار التنقل
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const route = e.currentTarget.dataset.route;
      history.pushState({ route }, "", `#${route}`);
      loadPage(route);
    });
  });
}

// ✅ دعم الرجوع للأمام والخلف
window.addEventListener("popstate", (e) => {
  const route = (e.state && e.state.route) || "home";
  loadPage(route);
});

// ✅ مؤثر تحميل
function showLoader() {
  if (!document.getElementById("loader")) {
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.remove();
}

// ✅ تسجيل Service Worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("✅ Service Worker Registered"))
      .catch((err) => console.warn("❌ SW Error:", err));
  }
}

// ✅ التحقق من الجلسة
function checkSession() {
  const session =
    JSON.parse(localStorage.getItem("userSession")) ||
    JSON.parse(sessionStorage.getItem("userSession"));
  if (!session) {
    window.location.href = "login.html";
  }
}

// ✅ إشعارات مستقبلية
function askNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("مرحبًا بك في TopClim! 🧊");
      }
    });
  }
}

// ✅ التنقل البرمجي
window.navigateTo = function (route) {
  history.pushState({ route }, "", `#${route}`);
  loadPage(route);
};

// ✅ بداية التطبيق
function initApp() {
  const route = window.location.hash.replace("#", "") || "home";
  loadPage(route);
  initNavigation();
  registerServiceWorker();
  checkSession();
}

// ✅ تنفيذ عند تحميل DOM
window.addEventListener("DOMContentLoaded", () => {
  showLoader();
  setTimeout(() => {
    hideLoader();
    initApp();
    // askNotificationPermission(); // فعّل إذا أردت إشعارات لاحقًا
  }, 800);
});


// ✅ دعم زر التثبيت PWA
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("✅ beforeinstallprompt event fired");
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.style.display = "block";

    installBtn.addEventListener(
      "click",
      async () => {
        console.log("📲 تم الضغط على زر التثبيت");

        if (!deferredPrompt) {
          alert("⚠️ لا يمكن عرض مربع التثبيت حالياً");
          return;
        }

        try {
          await deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;

          if (result.outcome === "accepted") {
            console.log("✅ المستخدم وافق على التثبيت");
          } else {
            console.log("❌ المستخدم رفض التثبيت");
          }

          installBtn.style.display = "none";
          deferredPrompt = null;
        } catch (err) {
          console.error("❌ خطأ أثناء التثبيت:", err);
        }
      },
      { once: true }
    );
  }
});
