// 📦 utils.js – دوال مساعدة عامة قابلة لإعادة الاستخدام في كل الصفحات

// ✅ تنسيق الاسم الكامل
export function formatName(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ✅ توليد رقم عشوائي في مجال محدد
export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ✅ إنشاء معرف فريد
export function generateId(prefix = "ID") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

// ✅ التحقق من صحة البريد الإلكتروني
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ✅ التحقق من قوة كلمة المرور
export function isStrongPassword(password) {
  return password.length >= 6;
}

// ✅ تنسيق التاريخ
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// ✅ تنسيق الوقت
export function formatTime(timeStr) {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ✅ نسخ النص إلى الحافظة
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("📋 تم نسخ النص إلى الحافظة"))
    .catch(() => alert("❌ تعذر نسخ النص"));
}

// ✅ تأخير (delay)
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ فلترة حسب حقل
export function filterByField(dataArray, field, value) {
  return dataArray.filter(item => item[field] === value);
}

// ✅ ترتيب مصفوفة حسب حقل معين
export function sortByField(dataArray, field, ascending = true) {
  return dataArray.sort((a, b) => {
    if (a[field] < b[field]) return ascending ? -1 : 1;
    if (a[field] > b[field]) return ascending ? 1 : -1;
    return 0;
  });
}

// ✅ التحقق من كائن فارغ
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

// ✅ التخزين في localStorage
export function saveToLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ✅ القراءة من localStorage
export function loadFromLocal(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// ✅ الحذف من localStorage
export function removeFromLocal(key) {
  localStorage.removeItem(key);
}

// ✅ عرض رسالة تنبيه عابرة (Toast)
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: type === "danger" ? "#f44336" :
                     type === "success" ? "#4caf50" :
                     type === "info" ? "#2196f3" : "#555",
    color: "white",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    zIndex: "9999",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "opacity 0.3s ease"
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ✅ جلب بيانات JSON من رابط خارجي
export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("فشل في تحميل البيانات");
  return await res.json();
}

// ✅ تنسيق رقم الهاتف الجزائري
export function formatAlgerianPhone(phone) {
  return phone.replace(/^0/, "+213 ").replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3");
}

// ✅ تعيين سمة لعنصر
export function setAttr(el, attr, value) {
  if (el) el.setAttribute(attr, value);
}

// ✅ تفريغ عنصر
export function clearElement(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}

// ✅ دمج مصفوفتين بدون تكرار
export function mergeUnique(arr1, arr2) {
  return [...new Set([...arr1, ...arr2])];
}

// ✅ التحقق مما إذا كان العنصر ظاهرًا في العرض
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ✅ إزالة العناصر الفارغة من مصفوفة
export function cleanArray(arr) {
  return arr.filter(val => val != null && val !== "");
}

// ✅ دمج كائنين
export function mergeObjects(obj1, obj2) {
  return { ...obj1, ...obj2 };
}

// ✅ عرض كم مضى من الوقت
export function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}
