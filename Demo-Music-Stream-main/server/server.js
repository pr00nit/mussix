const express = require("express");
const axios = require("axios");

const app = express();


const server = require("http").createServer(app);
server.listen(3000, () => {
  console.log("Server listening on port 3000");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

//socket connections
io.on("connection", (socket) => {
  console.log("Client connected : " + socket.id);
  socket.on("disconnect", (reason, details) => {
    console.log(reason);
 });

  socket.on("playSong",(songUrl) => {
    
    io.emit("sendSong", songUrl);
    
  });

  socket.on('songPlay', (data)=>{
    console.log("Playing song : " + data);
    io.emit('startPlay', data);
  
  })

  socket.on("songPause", (data) => {
    console.log("Pausing song : " + data);
    io.emit("pauseSong", data);
  })
});


