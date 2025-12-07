import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

const ChatApp = () => {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const socketRef = useRef(null);

  const handleNewMessage = (data) => {
    setMessages((prev) => [data, ...prev]);
  };

  const handleUserUpdate = (userList) => setUsers(userList);

  const joinChat = () => {
    if (!username.trim()) return;

    socketRef.current = io("http://localhost:5002");
    socketRef.current.emit("join", username);
    socketRef.current.on("message", handleNewMessage);
    socketRef.current.on("users", handleUserUpdate);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("message", { username, message });
    setMessage("");
  };

  const logout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    setUsername(""); setJoined(false); setMessages([]); setUsers([]);
  };

  const onChangeUsername = useCallback((e) => setUsername(e.target.value), []);

  return (
    <>
    
      <div className="bubble b1"></div>
      <div className="bubble b2"></div>
      <div className="bubble b3"></div>
      <div className="bubble b4"></div>

      
      <div className="chat-container">

        
        <div className="navbar">
          <h1>Chit-Chat</h1>
        </div>

        
        {!joined ? (
          <>
            <h2 className="welcome-text">Welcome to Chit-Chat — Connect & talk in real time!</h2>

            <div className="chat-header start-box">
              <h2>Enter Your Name</h2>

              <div className="username-input">
                <input
                  type="text"
                  placeholder="Username..."
                  value={username}
                  onChange={onChangeUsername}
                />
                <button onClick={joinChat}>Join Chat</button>
              </div>
            </div>
          </>
        ) : (

        
          <>
            <div className="chat-header joined">
              <div>Welcome, {username}!</div>
              <button onClick={logout}>Logout</button>
            </div>

            <div className="users">
              <strong>Online Users:</strong> {users.join(", ")}
            </div>

            <div className="message-list">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.username === username ? "me" : ""
                  } ${msg.message.includes("joined the chat.") ||
                    msg.message.includes("has left the chat.")
                    ? "system"
                    : ""}`}
                >
                  <strong>{msg.username}:</strong> {msg.message}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatApp;
