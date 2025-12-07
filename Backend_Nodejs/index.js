const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [ "http://localhost:5173", "http://localhost:5174" ],
        methods: ["GET", "POST"]
    }
});

let users = [];

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join", (username) => {
        users.push({ id: socket.id, username });

        io.emit("users", users.map(u => u.username));

        // SYSTEM JOIN MESSAGE
        io.emit("message", {
            username: "System",
            message: `${username} has joined the chat.`
        });
    });

    // THIS MUST MATCH frontend emit("message")
    socket.on("message", (data) => {
        console.log("Message received:", data);
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            users = users.filter(u => u.id !== socket.id);

            io.emit("users", users.map(u => u.username));

            // SYSTEM LEAVE MESSAGE
            io.emit("message", {
                username: "System",
                message: `${user.username} has left the chat.`
            });
        }
    });
});

server.listen(5002, () => console.log("Server running on port 5002"));
