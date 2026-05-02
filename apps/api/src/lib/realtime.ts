import type { Server } from "socket.io";

let io: Server | null = null;

export function setRealtimeServer(server: Server) {
  io = server;
}

export function emitAvisoCriado(payload: unknown) {
  io?.emit("avisos:criado", payload);
}

export function emitAvisoAtualizado(payload: unknown) {
  io?.emit("avisos:atualizado", payload);
}

export function emitAvisoRemovido(payload: unknown) {
  io?.emit("avisos:removido", payload);
}
