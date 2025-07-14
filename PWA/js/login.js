import { login, fetchDoc } from "./firebase.js";

// ✅ عناصر DOM
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const rememberMeCheckbox = document.getElementById("rememberMe");
const togglePassword = document.getElementById("togglePassword");
const greetingEl = document.getElementById("greeting");

// ✅ عرض رسالة خطأ
function showError(message = "حدث خطأ في تسجيل الدخول") {
  loginError.innerHTML = `<span>❌ ${message}</span>`;
  loginError.style.display = "block";
  loginError.classList.add("fade-in");
  setTimeout(() => {
    loginError.style.display = "none";
    loginError.classList.remove("fade-in");
  }, 4000);
}

// ✅ حفظ الجلسة
function saveSession(user, role, remember) {
  const sessionData = {
    uid: user.uid,
    email: user.email,
    role,
    timestamp: Date.now(),
  };
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("userSession", JSON.stringify(sessionData));
}

// ✅ توجيه المستخدم بعد تسجيل الدخول
function redirectToDashboard(role) {
  switch (role) {
    case "admin":
      window.location.href = "index.html";
      break;
    case "worker":
      window.location.href = "worker.html";
      break;
    default:
      showError("⚠️ دور غير معروف. يرجى التواصل مع الإدارة.");
  }
}

// ✅ تسجيل الدخول عبر Firebase + تحقق من admins أو workers
async function handleLogin(email, password, remember) {
  try {
    const userCredential = await login(email, password);
    const user = userCredential.user;

    let userData = await fetchDoc("admins", user.uid);
    let role = "admin";

    if (!userData) {
      userData = await fetchDoc("workers", user.uid);
      role = "worker";
    }

    if (!userData) {
      showError("❌ لم يتم العثور على بيانات هذا المستخدم.");
      resetButton();
      return;
    }

    saveSession(user, role, remember);
    redirectToDashboard(role);
  } catch (error) {
    console.error("❌ Firebase Login Error:", error.message);
    showError("❌ البريد أو كلمة المرور غير صحيحة.");
    resetButton();
  }
}

// ✅ إعادة تفعيل الزر
function resetButton() {
  loginBtn.disabled = false;
  loginBtn.innerText = "تسجيل الدخول";
}

// ✅ تحية حسب الوقت
function showGreeting() {
  const hour = new Date().getHours();
  let greeting = "👋 مرحبًا!";
  if (hour < 12) greeting = "☀️ صباح الخير!";
  else if (hour < 18) greeting = "🌤️ مساء الخير!";
  else greeting = "🌙 مساء الخير!";
  if (greetingEl) greetingEl.textContent = greeting;
}

// ✅ التحقق من وجود جلسة نشطة
function checkActiveSession() {
  const session =
    JSON.parse(localStorage.getItem("userSession")) ||
    JSON.parse(sessionStorage.getItem("userSession"));
  if (session && session.role) {
    redirectToDashboard(session.role);
  }
}

// ✅ إظهار/إخفاء كلمة المرور
if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.textContent =
      type === "password" ? "👁️ إظهار كلمة المرور" : "🙈 إخفاء";
  });
}

// ✅ تحسين تجربة الكتابة
emailInput?.addEventListener("keyup", (e) => {
  if (e.key === "Enter") passwordInput.focus();
});

passwordInput?.addEventListener("keyup", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

// ✅ تصحيح تلقائي للبريد
emailInput?.addEventListener("blur", () => {
  emailInput.value = emailInput.value.trim().toLowerCase();
});

// ✅ معالجة النموذج
loginForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  loginBtn.disabled = true;
  loginBtn.innerText = "⏳ جاري التحقق...";

  const email = emailInput.value;
  const password = passwordInput.value;
  const remember = rememberMeCheckbox.checked;

  if (!email || !password) {
    showError("❌ يرجى إدخال البريد وكلمة المرور.");
    resetButton();
    return;
  }

  handleLogin(email, password, remember);
});

// ✅ تسجيل الخروج
export function logoutUser() {
  localStorage.removeItem("userSession");
  sessionStorage.removeItem("userSession");
  window.location.href = "login.html";
}

// ✅ إشعار عند عدم وجود اتصال إنترنت
window.addEventListener("offline", () => {
  showError("⚠️ لا يوجد اتصال بالإنترنت.");
});
window.addEventListener("online", () => {
  loginError.style.display = "none";
});

// ✅ تنظيف الجلسات القديمة
function clearOldSessions() {
  const session =
    JSON.parse(localStorage.getItem("userSession")) ||
    JSON.parse(sessionStorage.getItem("userSession"));

  if (!session) return;
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;

  if (now - session.timestamp > maxAge) {
    logoutUser();
  }
}

// ✅ تنظيف تلقائي كل 5 دقائق
setInterval(clearOldSessions, 5 * 60 * 1000);

// ✅ عند التحميل
showGreeting();
checkActiveSession();
