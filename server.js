const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        req.session.user = { username: users[username].username };
        res.redirect('/chat.html');
    } else {
        res.redirect('/login.html?error=Invalid credentials');
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!users[username]) {
        users[username] = { username, password };
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.redirect('/login.html');
    } else {
        res.redirect('/register.html?error=Username already exists');
    }
});

app.use((req, res, next) => {
    if (req.path.startsWith('/chat') && !req.session.user) {
        res.redirect('/login.html');
    } else {
        next();
    }
});

// Route to get the logged-in user's info
app.get('/user', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).send('Unauthorized');
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
