const Busboy = require('busboy')
const { logger, pipelineAsync, ON_UPLOAD_EVENT } = require('./util')
const { join } = require('path')
const { createWriteStream } = require('fs')

class UploadHandler {
    #io
    #socketId
    constructor(io, socketId) {
        this.#io = io;
        this.#socketId = socketId;
    }


    #handleFileBytes(filename) {
        async function* handleData(data) {
            for await (const item of data) {
                const size = item.length;
                logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
                this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size)
                yield item
            }
        }
        return handleData.bind(this)
    }


    async #onFile(fieldname, file, filename) {
        const saveFileTo = join(__dirname, '../', 'downloads', filename);
        logger.info(`Uploading: ${saveFileTo}`)

        await pipelineAsync(
            file,
            // Forma de passar argumentos para a função
            this.#handleFileBytes.apply(this, [filename]),
            createWriteStream(saveFileTo)
        )

        logger.info(`File [${filename}] got finished!`)
    }


    registerEvents(headers, onFinish) {
        const busboy = new Busboy({ headers })
        // Usar o bind p validar o contexto da classe
        busboy.on('file', this.#onFile.bind(this))
        busboy.on('finish', onFinish)

        return busboy;
    }


}

module.exports = UploadHandler