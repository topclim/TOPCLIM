// ✅ db.js – وحدة إدارة البيانات لواجهة TopClim

// ✅ استيراد الوظائف من Firebase
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

// ✅ المراجع العامة
const ordersRef = collection(db, "requests");
const usersRef = collection(db, "users");
const workersRef = collection(db, "workers");
const feedbackRef = collection(db, "feedback");
const logsRef = collection(db, "activityLogs");
const adminsRef = collection(db, "admins");

// ✅ إضافة طلب جديد
export async function addOrder(data) {
  data.createdAt = serverTimestamp();
  const docRef = await addDoc(ordersRef, data);
  return docRef.id;
}

// ✅ تعديل طلب
export async function updateOrder(id, updates) {
  const docRef = doc(db, "requests", id);
  await updateDoc(docRef, updates);
}

// ✅ حذف طلب
export async function deleteOrder(id) {
  const docRef = doc(db, "requests", id);
  await deleteDoc(docRef);
}

// ✅ جلب كل الطلبات
export async function getAllOrders() {
  const snapshot = await getDocs(ordersRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ✅ جلب الطلبات حسب العامل
export async function getOrdersByWorker(workerId) {
  const q = query(ordersRef, where("assignedTo", "==", workerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ✅ جلب طلب حسب ID
export async function getOrderById(orderId) {
  const docRef = doc(db, "requests", orderId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// ✅ إضافة مستخدم
export async function addUser(userData) {
  userData.createdAt = serverTimestamp();
  const docRef = await addDoc(usersRef, userData);
  return docRef.id;
}

// ✅ تحديث مستخدم
export async function updateUser(userId, updates) {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, updates);
}

// ✅ جلب مستخدم حسب ID
export async function getUserData(userId) {
  const docRef = doc(usersRef, userId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// ✅ جلب مستخدم حسب الإيميل
export async function getUserByEmail(email) {
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// ✅ جلب كل المستخدمين
export async function getAllUsers() {
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ حذف مستخدم
export async function deleteUser(userId) {
  const docRef = doc(db, "users", userId);
  await deleteDoc(docRef);
}

// ✅ جلب كل العمال
export async function getAllWorkers() {
  const snapshot = await getDocs(workersRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ✅ جلب عامل حسب ID
export async function getWorkerById(workerId) {
  const docRef = doc(db, "workers", workerId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// ✅ إضافة تقييم طلب
export async function addFeedback(orderId, feedback) {
  await addDoc(feedbackRef, {
    orderId,
    feedback,
    createdAt: serverTimestamp(),
  });
}

// ✅ إضافة سجل نشاط
export async function logActivity(action, meta = {}) {
  const data = {
    action,
    meta,
    timestamp: serverTimestamp(),
  };
  await addDoc(logsRef, data);
}

// ✅ عرض سجل النشاطات حسب طلب
export async function getOrderLogs(orderId) {
  const q = query(logsRef, where("meta.orderId", "==", orderId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}

// ✅ جلب الطلبات الحديثة
export async function getRecentOrders(limitCount = 5) {
  const q = query(ordersRef, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ إحصائيات الطلبات
export async function countOrdersByStatus() {
  const statuses = ["new", "in_progress", "done"];
  const results = {};

  for (const status of statuses) {
    const q = query(ordersRef, where("status", "==", status));
    const snapshot = await getDocs(q);
    results[status] = snapshot.size;
  }

  return results;
}

// ✅ البحث في الطلبات
export async function searchOrders(keyword) {
  const allOrders = await getAllOrders();
  const key = keyword.toLowerCase();
  return allOrders.filter((order) =>
    (order.name && order.name.toLowerCase().includes(key)) ||
    (order.phone && order.phone.includes(key))
  );
}

// ✅ تسجيل خروج المستخدم
export function logoutUser() {
  try {
    localStorage.removeItem("userId");
    sessionStorage.clear();
    location.href = "/login.html";
  } catch (error) {
    console.error("❌ خطأ أثناء تسجيل الخروج:", error);
  }
}

// ✅ مراقبة الطلبات مباشرة (Real-time)
export function subscribeToOrders(callback) {
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(result);
  });
}

// ✅ جلب إعدادات التسعير
export async function getPrices() {
  const docRef = doc(db, "settings", "prices");
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
}

// ✅ جلب محتوى الصفحة الرئيسية
export async function getLandingContent() {
  const docRef = doc(db, "landing", "landingContent");
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : {};
}

// ✅ جلب الأدوات الصغيرة والكبيرة
export async function getAllTools() {
  const smallTools = await getDocs(collection(db, "smallTools"));
  const bigTools = await getDocs(collection(db, "bigTools"));
  return {
    small: smallTools.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    big: bigTools.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}
