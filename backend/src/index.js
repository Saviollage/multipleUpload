const http = require('http');
const socketIo = require('socket.io');
const Routes = require('./routes');
const { logger } = require('./util');
const PORT = 3000;

const handler = function (req, res) {
    const defaultRoute = async (req, res) => res.end('Hello!')

    const routes = new Routes(io)
    const chosen = routes[req.method.toLowerCase()] || defaultRoute

    return chosen.apply(routes, [req, res])
}

const server = http.createServer(handler);
const io = socketIo(server, {
    cors: {
        origin: '*',
        credentials: false
    }
})

io.on('connection', (socket) => {
    logger.info('Nova conexao: ' + socket.id)
})


const startServer = () => {
    const { address } = server.address()
    logger.info(`Server running on http://${address}:${PORT}`)
}

server.listen(PORT, startServer)