const userTypeSelect = document.getElementById("user-type");
const teacherSection = document.getElementById("teacher-section");
const homeworkList = document.getElementById("homework-list");

// Show teacher/student view
userTypeSelect.addEventListener("change", () => {
  teacherSection.style.display = userTypeSelect.value === "teacher" ? "block" : "none";
  loadHomework();
});

// Add homework
function addHomework() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  if (!title || !description) return alert("Fill in both fields");

  db.collection("homeworks").add({
    title,
    description,
    readByStudent: false,
    doneByStudent: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Load homework list
function loadHomework() {
  db.collection("homeworks").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    homeworkList.innerHTML = "";
    snapshot.forEach(doc => {
      const hw = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${hw.title}</strong> - ${hw.description} <br/>
        ${userTypeSelect.value === "student" ? `
          <button onclick="markDone('${doc.id}')">${hw.doneByStudent ? "✅ Done" : "Mark as Done"}</button>
          <button onclick="markRead('${doc.id}')">${hw.readByStudent ? "📖 Read" : "Mark as Read"}</button>
        ` : `
          <button onclick="deleteHomework('${doc.id}')">🗑️ Delete</button>
        `}
      `;
      homeworkList.appendChild(li);
    });
  });
}

function deleteHomework(id) {
  db.collection("homeworks").doc(id).delete();
}

function markRead(id) {
  db.collection("homeworks").doc(id).update({ readByStudent: true });
}

function markDone(id) {
  db.collection("homeworks").doc(id).update({ doneByStudent: true });
}

// Default load
loadHomework();
