const getSwaggerData = require("./getSwaggerData.js")
const transformPaths = require("./transformPaths.js")
const transformSchemas = require("./transformSchemas.js")

const hanldleTransform = async (config) => {
    const data = await getSwaggerData(config.swaggerPath)
    transformSchemas(data.components.schemas, config)
    transformPaths(data.paths, config)
}
module.exports = hanldleTransform