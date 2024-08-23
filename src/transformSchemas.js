const { mkdirSync, writeFileSync } = require('fs');
const { splitType, getType, hanldeTransformChinese } = require('./utils');
const transformSchemas = (schemas, config) => {
    let str = `/* eslint-disable */\n/* tslint:disable */\ndeclare namespace ${config.namespace} {\n`;

    Object.keys(schemas).forEach(key => {
        const tramsformKey = key.includes('«') || key.includes('»') || key.match(/[\u4e00-\u9fa5]/) ? hanldeTransformChinese(key) : key;
        const schema = schemas[key];

        const title = schema.title ? `\n\t * title: ${schema.title}` : '';
        const description = schema.description ? `\n\t * description: ${schema.description}` : '';

        const properties = schema.properties;
        const type = schema.type;

        const isRightful = type === 'object' && properties

        if (isRightful) {
            str += (title || description) ? `\n\t/** ${title}${description} \n\t */\n` : "";
            str += `\n\tinterface ${tramsformKey} {\n`;
            Object.keys(properties).forEach(properties_key => {
                const properties_type = properties[properties_key].type
                const properties_$ref = properties[properties_key].$ref
                const properties_items = properties[properties_key].items
                if (properties_type === 'array' && properties_items) {
                    const description = properties[properties_key].description ? `\t\t/**\n\t\t * @description ${properties[properties_key].description} \n\t\t */\n` : ''
                    str += description
                    str += `\t\t${properties_key}: `
                    const propertie_type = properties_items.type
                    const propertie_$ref = properties_items.$ref
                    if (propertie_$ref) {
                        str += `${splitType(propertie_$ref)}[]\n`
                    } else if (propertie_type) {
                        str += `${getType(propertie_type)}[]\n`
                    }
                } else if (properties_type) {
                    const description = properties[properties_key].description ? `\t\t/**\n\t\t * @description ${properties[properties_key].description} \n\t\t */\n` : ''
                    str += description
                    str += `\t\t${properties_key}: `
                    if (properties_type === 'object' && properties_$ref) {
                        str += `${splitType(properties_$ref)}\n`
                    } else if (properties[properties_key].emum) {
                        str += `${properties[properties_key].emum.join('|')}\n`
                    } else {
                        str += `${getType(properties_type)}\n`
                    }
                }
            })
            str += `\t}`;
        }
    })
    str += '\n}';
    // 生成文件夹
    console.log('生成文件夹', config.outputPath);
    mkdirSync(config.outputPath, { recursive: true });
    writeFileSync(`${config.outputPath}/type.ts`, str);
}
module.exports = transformSchemas