const path = require('path')
const hanldleTransform = require('./src/index.js')
const transform = (config) => {
    if (!config.dirname) throw new Error("dirname is required and must be __dirname")
    if (!config.swaggerPath) throw new Error("swaggerPath is required")
    if (!config.importStatement) throw new Error("importStatement is required")
    hanldleTransform({
        swaggerPath: config.swaggerPath,
        namespace: config.namespace || 'API',
        outputPath: path.join(config.dirname, config.outputPath || 'api'),
        importStatement: config.importStatement,
        generateRequestFunction: config.generateRequestFunction || false,
    })
}
module.exports = transform
