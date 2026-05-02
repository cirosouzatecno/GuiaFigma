import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { setRealtimeServer } from "./lib/realtime.js";

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.ALLOWED_ORIGIN,
    credentials: true
  }
});

setRealtimeServer(io);

io.on("connection", (socket) => {
  socket.emit("avisos:ready", {
    message: "Canal de avisos ao vivo conectado."
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
});
