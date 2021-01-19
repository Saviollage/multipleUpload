const logger = require('pino')({
    prettyPrint: {
        ignore: 'pid,hostname'
    }
})

const { promisify } = require('util');
const { pipeline } = require('stream')

const pipelineAsync = promisify(pipeline)

const ON_UPLOAD_EVENT = 'file-uploaded'

module.exports = { logger, pipelineAsync, promisify, ON_UPLOAD_EVENT }