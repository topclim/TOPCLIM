document.getElementById("requestForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const type = document.getElementById("type").value.trim();

  if (!name || !phone || !address || !type) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  try {
    await db.collection("requests").add({
      name,
      phone,
      address,
      type,
      status: "مبدئي",
      createdAt: new Date()
    });
    alert("✅ تم إرسال الطلب بنجاح!");
    document.getElementById("requestForm").reset();
  } catch (error) {
    alert("❌ حدث خطأ أثناء الإرسال: " + error.message);
  }
});
