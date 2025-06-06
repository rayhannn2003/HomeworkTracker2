// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  remove,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAY7trpx0U8wvd5a59t2roeTcc_oErcR84",
  authDomain: "homeworktrackerfirebase.firebaseapp.com",
  projectId: "homeworktrackerfirebase",
  storageBucket: "homeworktrackerfirebase.firebasestorage.app",
  messagingSenderId: "799548392721",
  appId: "1:799548392721:web:2a535687f7a1aed6d8b8b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const reviewsRef = ref(db, "reviews");

// DOM elements
const reviewForm = document.getElementById("reviewForm");
const fullName = document.getElementById("fullName");
const message = document.getElementById("message");
const tags = document.getElementById("tags");
const hiddenId = document.getElementById("hiddenId");
const reviews = document.getElementById("reviews");

// Set up all event listeners
setupEventHandlers();

function setupEventHandlers() {
  reviewForm.addEventListener("submit", e => {
    e.preventDefault();
    handleSubmit();
    Materialize.updateTextFields();
  });

  reviews.addEventListener("click", e => {
    updateReview(e);
    deleteReview(e);
  });

  onChildAdded(reviewsRef, snapshot => {
    readReviews(snapshot);
  });

  onChildChanged(reviewsRef, snapshot => {
    const reviewNode = document.getElementById(snapshot.key);
    reviewNode.innerHTML = reviewTemplate(snapshot.val());
  });

  onChildRemoved(reviewsRef, snapshot => {
    const reviewNode = document.getElementById(snapshot.key);
    if (reviewNode && reviewNode.parentNode) {
      reviewNode.parentNode.removeChild(reviewNode);
    }
  });
}

// Create or update a review
function handleSubmit() {
  if (!fullName.value || !message.value || !tags.value) return;

  const id = hiddenId.value || push(reviewsRef).key;

  set(ref(db, "reviews/" + id), {
    fullName: fullName.value,
    message: message.value,
    tags: tags.value,
    createdAt: serverTimestamp()
  });

  clearForm();
}

// Display new review
function readReviews(snapshot) {
  const li = document.createElement("li");
  li.id = snapshot.key;
  li.innerHTML = reviewTemplate(snapshot.val());
  reviews.appendChild(li);
}

// Edit a review
function updateReview(e) {
  const reviewNode = e.target.closest("li");
  if (e.target.classList.contains("edit")) {
    fullName.value = reviewNode.querySelector(".fullName").innerText;
    message.value = reviewNode.querySelector(".message").innerText;
    tags.value = reviewNode.querySelector(".tags").innerText;
    hiddenId.value = reviewNode.id;
    Materialize.updateTextFields();
  }
}

// Delete a review
function deleteReview(e) {
  const reviewNode = e.target.closest("li");
  if (e.target.classList.contains("delete")) {
    const id = reviewNode.id;
    remove(ref(db, "reviews/" + id));
    clearForm();
  }
}

// Review HTML template
function reviewTemplate({ fullName, message, tags, createdAt }) {
  const createdAtFormatted = createdAt
    ? new Date(createdAt).toLocaleString()
    : "Just now";

  return `
    <div>
      <label>Full Name:</label>
      <label class="fullName"><strong>${fullName}</strong></label>
    </div>
    <div>
      <label>Message:</label>
      <label class="message">${message}</label>
    </div>
    <div>
      <label>Tags:</label>
      <label class="tags">${tags}</label>
    </div>
    <div>
      <label>Created:</label>
      <label class="createdAt">${createdAtFormatted}</label>
    </div>
    <br>
    <button class="waves-effect waves-light btn delete">Delete</button>
    <button class="waves-effect waves-light btn edit">Edit</button>
    <br><br><br><br>
  `;
}

// Clear the form
function clearForm() {
  fullName.value = "";
  message.value = "";
  tags.value = "";
  hiddenId.value = "";
}
