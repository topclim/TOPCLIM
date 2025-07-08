// ✅ إعداد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjbzbSd1XM9eyXrgKaVj6xnZgIJuQmbRI",
  authDomain: "topclim-3edfa.firebaseapp.com",
  projectId: "topclim-3edfa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ متغير لتتبع حالة رفع الصور
let uploadInProgress = 0;

// ✅ رفع صورة إلى Cloudinary
window.uploadImage = async function (input, fieldId) {
  const file = input.files[0];
  if (!file) return;

  const statusSpan = document.getElementById("status_" + fieldId);
  statusSpan.textContent = "⬆️ جاري رفع الصورة...";
  uploadInProgress++;
  document.getElementById("saveBtn").disabled = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "topclim_upload");
  formData.append("folder", "TOPCLIMasset");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dtrmfg2om/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {
      document.getElementById(fieldId).value = data.secure_url;
      document.getElementById("preview_" + fieldId).src = data.secure_url;
      statusSpan.textContent = "✅ تم الرفع بنجاح";
      updatePreview();
    } else {
      statusSpan.textContent = "❌ فشل في رفع الصورة";
    }
  } catch (e) {
    statusSpan.textContent = "❌ خطأ في الاتصال";
  } finally {
    uploadInProgress--;
    if (uploadInProgress === 0) {
      document.getElementById("saveBtn").disabled = false;
    }
  }
};

// ✅ حفظ البيانات إلى Firebase
window.saveContent = async function () {
  if (uploadInProgress > 0) {
    alert("⏳ يرجى انتظار انتهاء رفع الصور أولاً");
    return;
  }

  const data = {
    headerTitle: document.getElementById("headerTitle").value,
    headerDesc: document.getElementById("headerDesc").value,
    bannerTop: document.getElementById("bannerTop").value,
    beforeImage: document.getElementById("beforeImage").value,
    afterImage: document.getElementById("afterImage").value,
    bannerBottom: document.getElementById("bannerBottom").value,
    footerText: document.getElementById("footerText").value,
    bgColor: document.getElementById("bgColor").value,
    headerColor: document.getElementById("headerColor").value,
    footerColor: document.getElementById("footerColor").value
  };

  try {
    await setDoc(doc(db, "landing", "landingContent"), data, { merge: true });
    alert("✅ تم الحفظ بنجاح");
    updatePreview();
  } catch (e) {
    alert("❌ خطأ أثناء الحفظ: " + e.message);
  }
};

// ✅ تحديث المعاينة في iframe
function updatePreview() {
  const preview = document.getElementById("previewPanel");
  const title = document.getElementById("headerTitle").value;
  const desc = document.getElementById("headerDesc").value;
  const bannerTop = document.getElementById("bannerTop").value;
  const beforeImage = document.getElementById("beforeImage").value;
  const afterImage = document.getElementById("afterImage").value;
  const bannerBottom = document.getElementById("bannerBottom").value;
  const footerText = document.getElementById("footerText").value;
  const bgColor = document.getElementById("bgColor").value;
  const headerColor = document.getElementById("headerColor").value;
  const footerColor = document.getElementById("footerColor").value;

  preview.srcdoc = `
    <style>
      body { font-family: 'Cairo', sans-serif; background: ${bgColor}; margin: 0; padding: 0; text-align: center; }
      header, footer { color: white; padding: 1em; }
      header { background: ${headerColor}; }
      footer { background: ${footerColor}; }
      section { padding: 20px; }
      .before-after img { width: 45%; margin: 2%; border-radius: 8px; }
    </style>
    <header>
      <h1>${title || "🌬️ TopClim"}</h1>
      <p>${desc || "خدمة تنظيف مكيفات احترافية وسريعة في بيتك"}</p>
    </header>
    <section><img src="${bannerTop}" style="max-width: 100%;" /></section>
    <section>
      <h3>📸 نتائج أعمالنا</h3>
      <div class="before-after">
        <img src="${beforeImage}" alt="قبل" />
        <img src="${afterImage}" alt="بعد" />
      </div>
    </section>
    <section><img src="${bannerBottom}" style="max-width: 100%;" /></section>
    <footer><p>${footerText || "© جميع الحقوق محفوظة لـ TopClim"}</p></footer>
  `;
}
