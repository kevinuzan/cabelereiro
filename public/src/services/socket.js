// io() is available globally via /socket.io/socket.io.js loaded in index.html
const ioClient = io();
const handlers = { novo_agendamento: new Set() };

Object.keys(handlers).forEach(event => {
    ioClient.on(event, (data) => handlers[event].forEach(fn => fn(data)));
});

export const socket = {
    on(event, callback) {
        const handler = handlers[event];
        if (handler) handler.add(callback);
        else console.warn(`Unknown event: ${event}`);
    },
    off(event, callback) {
        const handler = handlers[event];
        if (handler) handler.delete(callback);
    },
};