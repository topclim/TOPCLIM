async function loadWorkerTasks() {
  const container = document.getElementById("workerTasks");
  const snapshot = await db.collection("requests").where("status", "==", "جاري").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${data.name}</strong> - ${data.address}`;
    container.appendChild(div);
  });
}
window.onload = loadWorkerTasks;
