// navbar.js

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  const pages = document.querySelectorAll(".app-page");
  const fab = document.getElementById("fabBtn");

  const PAGE_KEY = "currentActivePage";

  // ✅ التنقل للصفحة
  function navigateTo(pageId, save = true) {
    // إخفاء كل الصفحات
    pages.forEach(p => p.style.display = "none");

    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.style.display = "block";
    }

    // تفعيل العنصر السفلي
    navItems.forEach(item => {
      item.classList.remove("active");
      if (item.dataset.page === pageId) {
        item.classList.add("active");
      }
    });

    // حفظ الصفحة
    if (save) {
      localStorage.setItem(PAGE_KEY, pageId);
    }

    // التعامل مع الزر العائم
    controlFAB(pageId);

    // تنفيذ دالة الصفحة (إن وجدت)
    if (typeof pageEvents[pageId] === "function") {
      pageEvents[pageId]();
    }
  }

  // ✅ زر التنقل السفلي
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const pageId = item.dataset.page;
      navigateTo(pageId);
    });
  });

  // ✅ إعداد الزر العائم (FAB)
  if (fab) {
    fab.addEventListener("click", () => {
      if (typeof fabActions[currentPage()] === "function") {
        fabActions[currentPage()]();
      }
    });
  }

  // ✅ تحديد الصفحة الحالية
  function currentPage() {
    return localStorage.getItem(PAGE_KEY) || "home-page";
  }

  // ✅ تحكم في عرض الزر العائم حسب الصفحة
  function controlFAB(pageId) {
    const hiddenOn = ["profile-page", "settings-page"];
    if (fab) {
      fab.style.display = hiddenOn.includes(pageId) ? "none" : "flex";
    }
  }

  // ✅ تنفيذ دوال معينة حسب كل صفحة
  const pageEvents = {
    "home-page": () => {
      console.log("🏠 الرئيسية");
      loadHomeData();
    },
    "orders-page": () => {
      console.log("📦 الطلبات");
      loadOrdersList();
    },
    "store-page": () => {
      console.log("🛍️ المتجر");
      fetchStoreItems();
    },
    "profile-page": () => {
      console.log("👤 الحساب");
      showProfile();
    },
    "settings-page": () => {
      console.log("⚙️ الإعدادات");
      loadSettings();
    },
    "stats-page": () => {
      console.log("📊 الإحصائيات");
      renderCharts();
    }
  };

  // ✅ مهام الزر العائم حسب الصفحة
  const fabActions = {
    "home-page": () => alert("أضف طلبًا جديدًا"),
    "orders-page": () => alert("فتح فلترة الطلبات"),
    "store-page": () => alert("أضف منتجًا جديدًا"),
    "stats-page": () => alert("تحديث الرسومات"),
  };

  // ✅ تحميل الصفحة الأولى عند التشغيل
  function initializeApp() {
    const firstPage = currentPage();
    navigateTo(firstPage, false);
  }

  initializeApp();
});


// ✅ وظائف وهمية للتجريب – عدلها حسب حاجتك

function loadHomeData() {
  const container = document.getElementById("homeContent");
  if (container) {
    container.innerHTML = "<p>مرحبًا بك في الصفحة الرئيسية</p>";
  }
}

function loadOrdersList() {
  const container = document.getElementById("ordersList");
  if (container) {
    container.innerHTML = "<ul><li>طلب رقم 001</li><li>طلب رقم 002</li></ul>";
  }
}

function fetchStoreItems() {
  const container = document.getElementById("storeItems");
  if (container) {
    container.innerHTML = "<div>عرض المنتجات من المخزن...</div>";
  }
}

function showProfile() {
  const container = document.getElementById("profileInfo");
  if (container) {
    container.innerHTML = "<h3>👤 اسم المستخدم: علي</h3>";
  }
}

function loadSettings() {
  const container = document.getElementById("settingsBox");
  if (container) {
    container.innerHTML = "<p>الإعدادات ستُضاف لاحقًا...</p>";
  }
}

function renderCharts() {
  const container = document.getElementById("chartArea");
  if (container) {
    container.innerHTML = "<p>📊 جاري عرض الرسومات البيانية...</p>";
  }
}
