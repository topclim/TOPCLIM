// ✅ home.js

import { db, getUserData } from '../firebase.js';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { formatDate, formatName, showToast } from '../utils.js';

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ تأكيد وجود جلسة
  const user = await getUserData();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // ✅ عناصر الواجهة
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");
  const fabBtn = document.getElementById("fabBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const dueCount = document.getElementById("dueCount");
  const balanceCount = document.getElementById("balanceCount");
  const orderList = document.getElementById("orderList");
  const addForm = document.getElementById("addForm");

  // ✅ التنقل بين الصفحات
  navItems?.forEach(item => {
    item.addEventListener("click", () => {
      const pageId = item.dataset.page;
      pages?.forEach(p => p.classList.remove("active"));
      navItems?.forEach(n => n.classList.remove("active"));
      document.getElementById(pageId)?.classList.add("page", "active");
      item.classList.add("active");
    });
  });

  // ✅ زر الإضافة (FAB)
  fabBtn?.addEventListener("click", () => {
    pages?.forEach(p => p.classList.remove("active"));
    document.getElementById("add-page")?.classList.add("page", "active");
  });

  // ✅ تسجيل الخروج
  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    location.href = "login.html";
  });

  // ✅ تحميل الطلبات من Firestore
  async function loadOrders() {
    try {
      const ref = collection(db, "requests");
      const snap = await getDocs(ref);

      let dueCounter = 0;
      let confirmedCounter = 0;
      let todayCounter = 0;
      const today = new Date().toISOString().slice(0, 10);

      orderList.innerHTML = "";

      snap.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `طلب #${doc.id.slice(-4)} – ${data.name || "مجهول"}`;

        const status = document.createElement("span");
        status.classList.add("status");

        if (data.status === "تم الإنجاز" || data.status === "تم التأكيد") {
          status.classList.add("confirmed");
          confirmedCounter++;
        } else {
          status.classList.add("pending");
          dueCounter++;
        }

        if (data.schedule && data.schedule.slice(0, 10) === today) {
          todayCounter++;
        }

        status.textContent = data.status || "قيد الانتظار";
        li.appendChild(status);
        orderList.appendChild(li);
      });

      // ✅ عرض الإحصائيات
      dueCount.textContent = dueCounter;
      balanceCount.textContent = confirmedCounter;
      document.querySelector(".cards .card:nth-child(1) .label").textContent = `عدد الطلبات: ${snap.size}`;
      document.querySelector(".cards .card:nth-child(2) .label").textContent = `تم الدفع: ${confirmedCounter}`;
      document.querySelector(".cards .card:nth-child(3) .label").textContent = `قيد الانتظار: ${dueCounter}`;
      document.querySelector(".cards .card:nth-child(4) .label").textContent = `طلبات اليوم: ${todayCounter}`;
    } catch (err) {
      console.error("❌ خطأ في تحميل الطلبات:", err);
      showToast("حدث خطأ أثناء تحميل الطلبات", "danger");
    }
  }

  // ✅ إرسال طلب جديد
  addForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const newOrder = {
      name: formData.get("customerName"),
      product: formData.get("product"),
      quantity: parseInt(formData.get("quantity")),
      status: "قيد الانتظار",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "requests"), newOrder);
      showToast("✅ تم إرسال الطلب بنجاح");
      addForm.reset();
      loadOrders();

      // الرجوع للصفحة الرئيسية
      pages.forEach(p => p.classList.remove("active"));
      document.getElementById("home-page").classList.add("page", "active");
      navItems.forEach(n => n.classList.remove("active"));
      document.querySelector('[data-page="home-page"]')?.classList.add("active");

    } catch (err) {
      console.error("❌ فشل إرسال الطلب:", err);
      showToast("فشل في إرسال الطلب", "danger");
    }
  });

  // ✅ تحميل الطلبات عند فتح الصفحة
  loadOrders();
});
