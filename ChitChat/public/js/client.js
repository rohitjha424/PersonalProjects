const socket = io();

const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
/* -------- AUTO GROW TEXTAREA -------- */

messageInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});
messageInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});

const messageContainer = document.querySelector(".container");
const audio = new Audio("ting.mp3");

let currentUserName = "";
let currentRoomCode = "";

/* ---------------- UI NAVIGATION ---------------- */

document.getElementById("create-btn").onclick = () => {
  document.getElementById("home-section").style.display = "none";
  document.getElementById("create-section").style.display = "flex";
};

document.getElementById("join-btn").onclick = () => {
  document.getElementById("home-section").style.display = "none";
  document.getElementById("join-section").style.display = "flex";
};

document.getElementById("back-btn1").onclick =
document.getElementById("back-btn2").onclick = () => {
  document.getElementById("home-section").style.display = "flex";
  document.getElementById("create-section").style.display = "none";
  document.getElementById("join-section").style.display = "none";
};

/* ---------------- CREATE ROOM ---------------- */

document.getElementById("create-room-btn").onclick = () => {
  const name = document.getElementById("create-name").value.trim();

  if (!name) {
    alert("Enter your name");
    return;
  }

  currentUserName = name;
  socket.emit("create-room", { userName: name });
};

/* ---------------- JOIN ROOM ---------------- */

document.getElementById("join-room-btn").onclick = () => {
  const name = document.getElementById("join-name").value.trim();
  const roomCode = document.getElementById("room-code").value.trim();

  if (!name || !roomCode) {
    alert("Enter all fields");
    return;
  }

  currentUserName = name;
  socket.emit("join-existing-room", { userName: name, roomCode });
};

/* ---------------- ENTER CHAT SCREEN ---------------- */

function enterChatScreen(roomCode) {
  currentRoomCode = roomCode;

  document.getElementById("home-section").style.display = "none";
  document.getElementById("create-section").style.display = "none";
  document.getElementById("join-section").style.display = "none";

  document.getElementById("myDiv").style.display = "block";
  document.getElementById("send-container").style.display = "flex";
  document.getElementById("room-des").style.display = "flex";

  document.querySelector("#room-des h2").innerText =
    "Room ID : " + roomCode;
}

/* ---------------- SOCKET EVENTS ---------------- */

socket.on("room-created", ({ roomCode }) => {
  audio.play();
  enterChatScreen(roomCode);
});

socket.on("room-joined", ({ roomCode }) => {
  audio.play();
  enterChatScreen(roomCode);
});

socket.on("room-error", (message) => {
  alert(message);
});

socket.on("user-joined", (name) => {
  audio.play();
  append(`${name} joined the chat`, "middleg");
});

socket.on("receive", (data) => {
  audio.play();
  append(`${data.name}: ${data.message}`, "left");
});

socket.on("left", (name) => {
  audio.play();
  append(`${name} left the chat`, "middler");
});

/* ---------------- MESSAGE SEND ---------------- */

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();

  if (message !== "") {
    append(`You: ${message}`, "right");
    socket.emit("send", message);
    messageInput.value = "";
    messageInput.style.height = "39px";
  }
});

/* ---------------- LEAVE ROOM ---------------- */

document.getElementById("leave-btn").onclick = () => {
  socket.disconnect();
  window.location.reload();
};

/* ---------------- MESSAGE UI ---------------- */

function scrollToLast() {
  const myDiv = document.getElementById("myDiv");
  myDiv.scrollTop = myDiv.scrollHeight;
}

function append(message, position) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message", position);
  messageContainer.append(messageElement);
  scrollToLast();
}
