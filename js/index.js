document.getElementById("requestForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const type = document.getElementById("type").value;

  await db.collection("requests").add({
    name, phone, address, type,
    status: "مبدئي",
    createdAt: new Date()
  });
  alert("تم إرسال الطلب بنجاح");
});
