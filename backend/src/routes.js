const UploadHandler = require('./uploadHandler');
const { pipelineAsync, logger } = require('./util');

class Routes {
    #io
    constructor(io) {
        this.#io = io;
    }
    async options(req, res) {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST'
        })
        res.end()
    }
    async post(req, res) {
        const { headers } = req;
        const socketId = new URL(`http://${req.headers.host}${req.url}`).searchParams.get('socketId')
        const uploadHandler = new UploadHandler(this.#io, socketId)
        // Será executada quando arquivo finalizar
        const onFinish = (res, reditectTo) => () => {
            res.writeHead(303, {
                Connection: 'close',
                Location: `${reditectTo}?msg=Files uploaded with success!`
            });
            res.end()
        }
        const busboyInstance = uploadHandler.registerEvents(headers, onFinish(res, headers.origin))
        await pipelineAsync(req, busboyInstance)
        logger.info(`Request finished with success!`)
    }
}
module.exports = Routes