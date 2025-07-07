function loginAdmin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      loadRequests();
    })
    .catch(error => alert("خطأ في تسجيل الدخول: " + error.message));
}

async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "topclim_upload");

  const res = await fetch("https://api.cloudinary.com/v1_1/dtrmfg2om/image/upload", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
}

async function loadRequests() {
  const container = document.getElementById("requestsContainer");
  const snapshot = await db.collection("requests").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${data.name}</strong> - ${data.phone} - ${data.status}`;
    container.appendChild(div);
  });
}

document.getElementById("imageUpload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const imageUrl = await uploadImageToCloudinary(file);
  alert("✔️ تم رفع الصورة: " + imageUrl);
});
