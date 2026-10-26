const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Menyimpan daftar user yang sedang online
const users = {}; 

io.on('connection', (socket) => {
    
    // Ketika ada user baru bergabung
    socket.on('new_user', (name) => {
        users[socket.id] = name;
        // Beritahu semua orang bahwa ada user baru
        socket.broadcast.emit('user_connected', name);
        // Kirim update daftar user ke semua orang
        io.emit('update_users', Object.values(users));
    });

    // Ketika menerima pesan
   // Ketika menerima pesan
    socket.on('chat_message', (msg) => {
        const senderName = users[socket.id]; // Ambil nama pengirim
        
       
        console.log(`[LOG] ${senderName} mengirim: ${msg}`); 
        
        
        socket.broadcast.emit('chat_message', { name: senderName, message: msg });
    });

    // Ketika user keluar/disconnect
    socket.on('disconnect', () => {
        const name = users[socket.id];
        if (name) {
            socket.broadcast.emit('user_disconnected', name);
            delete users[socket.id];
            io.emit('update_users', Object.values(users));
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});