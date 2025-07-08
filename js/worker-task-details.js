import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, updateDoc, collection, getDocs, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjbzbSd1XM9eyXrgKaVj6xnZgIJuQmbRI",
  authDomain: "topclim-3edfa.firebaseapp.com",
  projectId: "topclim-3edfa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const requestId = params.get("id");

let toolsSmall = [];
let toolsLarge = [];

// ✅ تحميل أدوات العمل
async function loadTools() {
  const smallSnap = await getDocs(collection(db, "toolsSmall"));
  const largeSnap = await getDocs(collection(db, "toolsLarge"));

  const smallContainer = document.getElementById("smallToolsContainer");
  const largeContainer = document.getElementById("largeToolsContainer");

  smallSnap.forEach(doc => {
    const tool = doc.data().name;
    toolsSmall.push(tool);
    const div = document.createElement("div");
    div.className = "tool-item";
    div.innerHTML = `<input type="checkbox" value="${tool}" /> ${tool}`;
    smallContainer.appendChild(div);
  });

  largeSnap.forEach(doc => {
    const tool = doc.data().name;
    toolsLarge.push(tool);
    const div = document.createElement("div");
    div.className = "tool-item";
    div.innerHTML = `<input type="checkbox" value="${tool}" /> ${tool}`;
    largeContainer.appendChild(div);
  });
}

// ✅ تحميل بيانات الطلب
async function loadRequestData() {
  if (!requestId) return;
  const docRef = doc(db, "requests", requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const data = snap.data();
  document.getElementById("clientName").innerText = data.name;
  document.getElementById("clientAddress").innerText = data.address;
}

// ✅ رفع صورة إلى Cloudinary
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "topclim_upload");
  formData.append("folder", "WorkerPhotos");

  const res = await fetch("https://api.cloudinary.com/v1_1/dtrmfg2om/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
}

// ✅ عند إنهاء العمل
document.getElementById("finishBtn").addEventListener("click", async () => {
  const indoor = document.getElementById("indoorCount").value;
  const outdoor = document.getElementById("outdoorCount").value;
  const maintenance = document.getElementById("maintenanceCount").value;
  const publicNotes = document.getElementById("publicNotes").value;
  const privateNotes = document.getElementById("privateNotes").value;
  const opportunityNote = document.getElementById("opportunityNote").value;
  const imageFile = document.getElementById("finishImage").files[0];

  // أدوات مختارة
  const selectedSmall = Array.from(document.querySelectorAll("#smallToolsContainer input:checked")).map(el => el.value);
  const selectedLarge = Array.from(document.querySelectorAll("#largeToolsContainer input:checked")).map(el => el.value);

  // مقارنة بالأصل: هل هناك أدوات ناقصة؟
  const missingSmall = toolsSmall.filter(tool => !selectedSmall.includes(tool));
  const missingLarge = toolsLarge.filter(tool => !selectedLarge.includes(tool));

  // رفع صورة
  let imageUrl = "";
  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  // تحديث الطلب
  try {
    await updateDoc(doc(db, "requests", requestId), {
      status: "تم الإنجاز",
      workDone: {
        indoor: parseInt(indoor),
        outdoor: parseInt(outdoor),
        maintenance: parseInt(maintenance),
        publicNotes,
        privateNotes,
        opportunityNote,
        photo: imageUrl,
        toolsUsed: {
          small: selectedSmall,
          large: selectedLarge
        },
        missingTools: {
          small: missingSmall,
          large: missingLarge
        },
        finishedAt: new Date()
      }
    });

    // إرسال إنذار إذا كانت الأدوات ناقصة
    if (missingSmall.length > 0 || missingLarge.length > 0) {
      await addDoc(collection(db, "alerts"), {
        requestId,
        missingSmall,
        missingLarge,
        timestamp: new Date()
      });
      alert("⚠️ تم إرسال إشعار بفقدان الأدوات!");
    }

    alert("✅ تم حفظ تنفيذ العمل بنجاح");
    window.location.href = "worker-tasks.html";

  } catch (e) {
    console.error(e);
    alert("❌ حدث خطأ أثناء حفظ العمل");
  }
});

// تشغيل
loadTools();
loadRequestData();
