// CONFIGURAZIONE FIREBASE - DA COMPILARE
const firebaseConfig = {
  apiKey: "AIzaSyD2gy0mjjEcsHdm31O8FAgsj3rgu_c9e5w",
  authDomain: "sfogamic.firebaseapp.com",
  projectId: "sfogamic",
  storageBucket: "sfogamic.appspot.com",
  messagingSenderId: "833464719356",
  appId: "1:833464719356:web:9be4b2e87b6f31dc8c0479",
  measurementId: "G-RP6VMC5TG0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Form pubblico
const commentForm = document.getElementById("comment-form");
if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const content = document.getElementById("comment-input").value.trim();
        if (content) {
            await db.collection("comments").add({
                text: content,
                approved: false,
                reported: false,
                timestamp: new Date()
            });
            commentForm.reset();
            alert("Commento inviato! Sarà visibile dopo l'approvazione.");
        }
    });
}

// Admin panel
async function loadAdminComments() {
    const pendingContainer = document.getElementById("pending-messages");
    const publishedContainer = document.getElementById("published-messages");
    if (!pendingContainer || !publishedContainer) return;

    const snapshot = await db.collection("comments").orderBy("timestamp", "desc").get();
    pendingContainer.innerHTML = "";
    publishedContainer.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.textContent = data.text;

        if (data.reported) div.style.borderLeft = "5px solid red";

        if (!data.approved) {
            const approveBtn = document.createElement("button");
            approveBtn.textContent = "Approva";
            approveBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).update({ approved: true });
                loadAdminComments();
            };
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Elimina";
            deleteBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).delete();
                loadAdminComments();
            };
            div.appendChild(approveBtn);
            div.appendChild(deleteBtn);
            pendingContainer.appendChild(div);
        } else {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Elimina";
            deleteBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).delete();
                loadAdminComments();
            };
            publishedContainer.appendChild(div);
            div.appendChild(deleteBtn);
        }
    });
}

async function loadPublicComments() {
    const container = document.getElementById("messages");
    if (!container) return;

    const snapshot = await db.collection("comments")
        .where("approved", "==", true)
        .orderBy("timestamp", "desc")
        .get();

    container.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.textContent = data.text;

        const reportBtn = document.createElement("button");
        reportBtn.textContent = "Segnala";
        reportBtn.onclick = async () => {
            await db.collection("comments").doc(doc.id).update({ reported: true });
            alert("Commento segnalato.");
        };
        div.appendChild(reportBtn);
        container.appendChild(div);
    });
}

window.onload = () => {
    loadAdminComments();
    loadPublicComments();
};
