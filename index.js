const path = require('path')
const hanldleTransform = require('./src/index.js')
const transform = (config) => {
    const dirname = config.dirname || getCallerFilePath()
    if (!dirname) throw new Error("dirname retrieval failed")
    if (!config.swaggerPath) throw new Error("swaggerPath is required")
    if (!config.importStatement) throw new Error("importStatement is required")
    hanldleTransform({
        swaggerPath: config.swaggerPath,
        namespace: config.namespace || 'API',
        outputPath: path.join(dirname, config.outputPath || 'api'),
        importStatement: config.importStatement,
        generateRequestFunction: config.generateRequestFunction || false,
    })
}
module.exports = transform
