// ✅ firebase.js – إعداد متكامل لـ Firebase مع Firestore و Auth و Persistence

// استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ إعدادات Firebase من مشروعك الحقيقي
const firebaseConfig = {
  apiKey: "AIzaSyBjbzbSd1XM9eyXrgKaVj6xnZgIJuQmbRI",
  authDomain: "topclim-3edfa.firebaseapp.com",
  projectId: "topclim-3edfa",
  storageBucket: "topclim-3edfa.appspot.com",
  messagingSenderId: "947089777564",
  appId: "1:947089777564:web:b347850ad03f5c39010f6e"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firestore + تفعيل الكاش المحلي


export const db = getFirestore(app);

enableIndexedDbPersistence(db)
  .then(() => {
    console.log("✅ IndexedDB Persistence Enabled");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("⚠️ تم فتح التطبيق في أكثر من تبويب. سيتم استخدام التخزين المؤقت في الذاكرة فقط.");
    } else if (err.code === 'unimplemented') {
      console.error("❌ المتصفح لا يدعم IndexedDB.");
    } else {
      console.error("❌ خطأ غير متوقع:", err.message);
    }
  });


// ✅ Auth
export const auth = getAuth(app);

// ✅ تسجيل الدخول
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ✅ تسجيل الخروج
export async function logout() {
  return signOut(auth);
}

// ✅ مراقبة المستخدم الحالي
export function onUserChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ✅ جلب مستند واحد
export async function fetchDoc(collectionName, docId) {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ✅ إضافة مستند جديد
export async function addData(collectionName, data) {
  data.createdAt = serverTimestamp();
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, data);
  return docRef.id;
}

// ✅ إنشاء مستند بمعرف معين
export async function createDocWithId(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
  return id;
}

// ✅ تحديث مستند
export async function updateData(collectionName, docId, updates) {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, updates);
}

// ✅ حذف مستند
export async function deleteData(collectionName, docId) {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
}

// ✅ جلب جميع المستندات من مجموعة
export async function fetchAll(collectionName) {
  const ref = collection(db, collectionName);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ استعلام حسب حقل
export async function fetchWhere(collectionName, field, operator, value) {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ جلب مستند حسب المسار الكامل
export async function getDocumentData(path) {
  const docRef = doc(db, path);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// ✅ مراقبة مجموعة كاملة
export function subscribeToCollection(collectionName, callback, sortField = "createdAt") {
  const q = query(collection(db, collectionName), orderBy(sortField, "desc"));
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(results);
  });
}

// ✅ مراقبة مستند محدد
export function subscribeToDoc(collectionName, docId, callback) {
  const ref = doc(db, collectionName, docId);
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

// ✅ إضافة سجل دخول عامل
export async function logWorkerLogin(uid, userAgent, ip = null) {
  const ref = doc(db, "workerLogins", uid);
  await setDoc(ref, {
    lastLogin: serverTimestamp(),
    userAgent,
    ip,
  });
}

// ✅ توليد طابع زمني للخادم
export function timestamp() {
  return serverTimestamp();
}

// ✅ firebase.js
export async function getUserData() {
  const session =
    JSON.parse(localStorage.getItem("userSession")) ||
    JSON.parse(sessionStorage.getItem("userSession"));
  return session || null;
}
