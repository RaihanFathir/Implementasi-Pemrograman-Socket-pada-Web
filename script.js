const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const myNameDisplay = document.getElementById('my-name');

let myName = '';

// 1. Proses Join Chat (Memasukkan Nama)
joinBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name !== '') {
        myName = name;
        myNameDisplay.textContent = myName;
        // Kirim info user baru ke server
        socket.emit('new_user', myName);
        // Sembunyikan pop-up modal
        nameModal.style.display = 'none';
        // Aktifkan kolom ketik pesan
        input.disabled = false;
        input.focus();
    }
});

// 2. Fungsi Mengirim Pesan
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && myName !== '') {
        const messageText = input.value;
        
        // Tampilkan pesan sendiri di layar sendiri (Kanan/msg-sent)
        appendMessage(myName, messageText, 'msg-sent');
        
        // Kirim pesan ke server
        socket.emit('chat_message', messageText);
        input.value = '';
    }
});

// 3. Menerima Pesan dari Orang Lain
socket.on('chat_message', (data) => {
    // Tampilkan pesan orang lain (Kiri/msg-received)
    appendMessage(data.name, data.message, 'msg-received');
});

// 4. Menerima Notifikasi Sistem (Gabung/Keluar)
socket.on('user_connected', (name) => {
    appendSystemMessage(`${name} has joined!`);
});

socket.on('user_disconnected', (name) => {
    appendSystemMessage(`${name} has left.`);
});

// 5. Update Daftar User di Sidebar
socket.on('update_users', (users) => {
    userList.innerHTML = ''; // Kosongkan daftar lama
    users.forEach(user => {
        const li = document.createElement('li');
        // Membuat inisial nama (2 huruf depan)
        const initials = user.substring(0, 2).toUpperCase();
        li.innerHTML = `<div class="avatar">${initials}</div> ${user}`;
        userList.appendChild(li);
    });
});

// --- Fungsi-fungsi Bantuan UI ---

// Fungsi untuk merender pesan chat (gelembung)
function appendMessage(name, text, typeClass) {
    const li = document.createElement('li');
    li.classList.add('message', typeClass);
    
    const nameSpan = document.createElement('div');
    nameSpan.classList.add('sender-name');
    nameSpan.textContent = name;

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.textContent = text;

    li.appendChild(nameSpan);
    li.appendChild(textDiv);
    messages.appendChild(li);
    messages.scrollTo(0, messages.scrollHeight);
}

// Fungsi untuk merender pesan notifikasi sistem
function appendSystemMessage(text) {
    const li = document.createElement('li');
    li.classList.add('msg-system');
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTo(0, messages.scrollHeight);
}