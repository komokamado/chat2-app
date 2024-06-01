document.addEventListener('DOMContentLoaded', () => {
    let username = '';

    // Lấy thông tin người dùng từ máy chủ
    fetch('/user')
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login.html';
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                username = data.username;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            window.location.href = '/login.html'; // Redirect to login if not authorized
        });

    const chatForm = document.getElementById('chatForm');
    const chatBox = document.getElementById('chatBox');
    const socket = io();

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = document.getElementById('message').value;
            socket.emit('chat message', { username, message });
            document.getElementById('message').value = '';
        });

        socket.on('chat message', (data) => {
            const div = document.createElement('div');
            div.textContent = `${data.username}: ${data.message}`;
            chatBox.appendChild(div);
        });
    }
});
