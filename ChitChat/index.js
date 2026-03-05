const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8000;

const users = {};
const activeRooms = new Set();

/* -------- Generate Unique Room Code -------- */

function generateRoomCode() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let code;

  do {
    code =
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)] +
      "-" +
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)];
  } while (activeRooms.has(code));

  return code;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* -------- CREATE ROOM -------- */

  socket.on("create-room", ({ userName }) => {
    const roomCode = generateRoomCode();
    activeRooms.add(roomCode);

    users[socket.id] = { userName, roomCode };
    socket.join(roomCode);

    socket.emit("room-created", { roomCode });

    console.log(`${userName} created room ${roomCode}`);
  });

  /* -------- JOIN EXISTING ROOM -------- */

  socket.on("join-existing-room", ({ userName, roomCode }) => {
    if (!activeRooms.has(roomCode)) {
      socket.emit("room-error", "Room does not exist");
      return;
    }

    users[socket.id] = { userName, roomCode };
    socket.join(roomCode);

    socket.emit("room-joined", { roomCode });
    socket.to(roomCode).emit("user-joined", userName);

    console.log(`${userName} joined room ${roomCode}`);
  });

  /* -------- SEND MESSAGE -------- */

  socket.on("send", (message) => {
    const user = users[socket.id];

    if (user) {
      socket.to(user.roomCode).emit("receive", {
        message,
        name: user.userName,
      });
    }
  });

  /* -------- DISCONNECT -------- */

  socket.on("disconnect", () => {
    const user = users[socket.id];

    if (user) {
      socket.to(user.roomCode).emit("left", user.userName);

      delete users[socket.id];

      // If room empty, delete it
      const room = io.sockets.adapter.rooms.get(user.roomCode);
      if (!room) {
        activeRooms.delete(user.roomCode);
        console.log("Room deleted:", user.roomCode);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});