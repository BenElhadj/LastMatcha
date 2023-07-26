require('dotenv').config()
let bodyParser = require('body-parser')
const express = require('express')

const cors = require('cors')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.PORT || 3000
const app = express()
const passport = require('passport')
const pool = require('./src/utility/database')
const ejs = require('ejs')
const mailv = require('./src/utility/mail')
const os = require('os');

const interfaces = os.networkInterfaces();
let ipAddress = '';

Object.keys(interfaces).forEach(ifname => {
    interfaces[ifname].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
        }
    });
});


app.use(passport.initialize())

var corsOptions = {
    origin: '*',
    credentials: true
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb', extended: true }))

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs')

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// routes 

app.use(express.static(`${path.dirname(path.dirname(__dirname))}/client/dist`))
app.use('/api/users/', require('./src/routes/userRoutes'))
app.use('/api/auth/', require('./src/routes/authRoutes'))
app.use('/api/browse/', require('./src/routes/browsingRoutes'))
app.use('/api/chat/', require('./src/routes/chatRoutes'))
app.use('/api/notif/', require('./src/routes/notifRoutes'))
app.use('/api/matching/', require('./src/routes/matchingRoutes'))

app.get(/.*/, (req, res) => res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html')))
// app.get(/.*/, (req, res) => res.sendFile(path.join(`${path.dirname(path.dirname(__dirname))}/BMATCHA/client/dist`, 'index.html')))

const server = http.createServer(app)
app.get('/home/', (req, res) => {
    res.send('Hello World!');
})

app.get('/', (req, res) => {
    res.send('Hello World Home page!');
})


app.get('/api', (req, res) => {
    res.send('Hello World api!');
})

const io = socketIo(server, { pingInterval: 10, pingTimeout: 4000 })

let users = {}

io.on('connection', socket => {
    socket.on('chat', data => {
        const id = users[data.id_to]
        if (id) io.sockets.connected[id].emit('chat', data)
    })
    socket.on('typing', data => {
        const id = users[data.id_to]
        if (id) io.sockets.connected[id].emit('typing', data)
    })
    socket.on('seenConvo', data => {
        const id = users[data.user]
        if (id) io.sockets.connected[id].emit('seenConvo', data.convo)
    })
    socket.on('match', data => {
        const id = users[data.id_to]
        if (id) io.sockets.connected[id].emit('match', data)
    })
    socket.on('visit', data => {
        const id = users[data.id_to]
        if (id) io.sockets.connected[id].emit('visit', data)
    })
    socket.on('block', data => {
        const id = users[data.id_to]
        if (id) io.sockets.connected[id].emit('block', data.id_from)
    })
    socket.on('auth', id => {
        users[id] = socket.id
        io.emit('online', Object.keys(users))
    })
    socket.on('logout', id => {
        try {
            const sql = `UPDATE users SET status = NOW() WHERE id = ?`
            pool.query(sql, [id])
        } catch (err) {
            console.log('Got error here -->', err)
        }
        delete users[id]
        io.emit('out', Object.keys(users))
    })
    socket.on('disconnect', () => {
        for (let key of Object.keys(users)) {
            if (users[key] === socket.id) {
                try {
                    const sql = `UPDATE users SET status = NOW() WHERE id = ?`
                    pool.query(sql, [key])
                } catch (err) {
                    console.log('Got error here -->', err)
                }
                delete users[key]
                io.emit('online', Object.keys(users))
                socket.disconnect()
            }
        }
    })
})

// server.listen(port, () => console.log(`The server has started on port -> ${port}`))
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n\nServer Backend Matcha:`);
    console.log(`\n-----> Operating locally at the port ${PORT}\n-----> Networked at IP ${ipAddress} at the port ${PORT}\n`);
    console.log(`- Local:   \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
});
app.listen(4000, ipAddress, () => {
    console.log(`- Network: \x1b[32mhttp://${ipAddress}:${4000}\x1b[0m\n\n`);
});