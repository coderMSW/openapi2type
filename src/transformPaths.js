const { writeFileSync } = require('fs')
const { splitPath, getType, splitType } = require("./utils.js")
let config = {}
const buildDescription = (tags, summary, description) => {
    const tagsText = tags ? `\n\ * tags: ${tags.join(',')}` : ''
    const summaryText = summary ? `\n * summary: ${summary}` : ''
    const descriptionText = description ? `\n * description: ${description}` : ''
    return (tagsText || summaryText || descriptionText) ? `\n/**${tagsText}${summaryText}${descriptionText} \n */ ` : ""
}
const buildPathOption = (pathParams, interfaceName) => {
    if (pathParams.length === 0) return ''
    const str = `\ninterface ${interfaceName} {\n\tpath: {\n\t\t${pathParams.map(item => `${item.name}: ${item.type}`).join('\n')}\n\t}\n}`
    return str
}
const buildQueryOption = (queryParams, interfaceName) => {
    if (queryParams.length === 0) return ''
    const str = `\ninterface ${interfaceName} {\n\tparams: {\n${queryParams.map(item => `\t\t${item.name}: ${item.type}`).join('\n')}\n\t}\n}`
    return str
}
const buildBodyOption = (requestBody, interfaceName) => {
    if (requestBody && requestBody.content) {
        if (requestBody.content['application/json']) {
            const data = requestBody.content['application/json']
            const schema = data.schema
            if (schema) {
                let str = ''
                str += `\ninterface ${interfaceName} {\n\tbody: {\n\t\t`

                str += getSchema(schema, 'dto')
                str += `\n\t}\n}`
                return str
            } else {
                return ''
            }
        } else if (requestBody.content['multipart/form-data']) {
            const data = requestBody.content['multipart/form-data']
            const schema = data.schema
            if (schema) {
                let str = ''
                str += `\ninterface ${interfaceName} {\n\tbody: {\n\t\t`

                str += getSchema(schema, 'dto')
                str += `\n\t}\n}`
                return str
            } else {
                return ''
            }
        }

    } else {
        return ''
    }
}
const getSchema = (schema, key) => {
    let str = ''
    if (schema.$ref) {
        const d = splitType(schema.$ref)
        str += `${d}: ${config.namespace}.${d}`
    } else if (schema.type === 'object') {
        const properties = schema.properties || {}
        Object.keys(properties).forEach(k => {
            const propertie = properties[k]
            str += getSchema(propertie, k)
        })
    } else if (schema.type === 'array') {
        // str += `${key}: ${getType(propertie.type)}[]`
        str += getSchema(schema.items, key) + '[]'
    } else {
        str += `${key}: ${getType(schema.type)}`
    }
    return str
}
const buildResponse = (responses) => {

    const responses200 = responses['200']
    if (!responses200) return ''

    const content = responses200.content
    if (!content) return ''

    const content200 = content['*/*']
    if (!content200) return ''

    const schema = content200.schema
    if (!schema) return ''
    if (schema.$ref) {
        return splitType(schema.$ref)
    } else {
        console.warn('msw: warning: schema.$ref is not support')
    }
}
const buildRequest = (requestPath, path, method, responses, interfaceName, isHasOption) => {
    let str = ''
    const Option = isHasOption ? `options: ${interfaceName}, ` : ''
    str += `\nexport const ${requestPath} = (${Option}config?: AxiosRequestConfig) =>\n\trequester<${interfaceName ? 'API.' + responses : 'any'
        }>('${path}', { method: '${method}'${isHasOption ? ', ...options' : ''} }, config)`

    return config.generateRequestFunction ? config.generateRequestFunction({
        requestName: requestPath,
        optionsName: interfaceName,
        responsesName: interfaceName ? responses : 'any',
        path: path,
        method: method,
        isHasOption: isHasOption
    }) : str
}
const getParameters = (parameters) => {
    const pathParams = []
    const queryParams = []
    if (!parameters) return [pathParams, queryParams]
    parameters.forEach(item => {
        if (item.in === 'path') {
            if (item.schema.type === 'array' || item.schema.type === 'object') {
                throw new Error('path参数不支持数组')
            }
            pathParams.push({
                name: item.name,
                in: item.in,
                description: item.description,
                required: item.required,
                type: getType(item.schema.type),
            })
        } else if (item.in === 'query') {
            if (item.schema.type === 'array' || item.schema.type === 'object') {
                throw new Error('query参数不支持数组')
            }
            queryParams.push({
                name: item.name,
                in: item.in,
                description: item.description,
                required: item.required,
                type: getType(item.schema.type),
            })
        }
    })
    return [pathParams, queryParams]
}
// tags summary description | parameters requestBody | responses
const transformPaths = (paths, c) => {
    config = c || {}
    let str = '/* eslint-disable */\n/* tslint:disable */\n';
    str += `${config.importStatement}\n`
    Object.keys(paths).forEach(path => {
        const { $ref, summary, description, get, put, post, options, parameters } = paths[path];
        const deleteItem = paths[path]['delete']
        const [pathParams, queryParams] = getParameters(parameters)
        const summaryText = summary ? `\n\t * summary: ${summary} ` : ''
        const descriptionText = description ? `\n\t * description: ${description} ` : ''
        str += (summaryText || descriptionText) ? `/** ${summaryText} ${descriptionText} */\n` : ''

        if ($ref) {
            throw new Error('$ref is not supported')
        }
        if (get) {
            // 拼接生成接口名字
            const requestPath = splitPath('Get', path)
            // 生成DTO名字
            const interfaceName = requestPath + 'Option'
            // 生成注释
            str += buildDescription(get.tags, get.summary, get.description)
            const [pathParamsChild, queryParamsChild] = getParameters(get.parameters)
            // path 的dto/vo
            const pathStr = buildPathOption([...pathParams, ...pathParamsChild], interfaceName)
            str += pathStr
            // query 的dto/vo
            const queryStr = buildQueryOption([...queryParams, ...queryParamsChild], interfaceName)
            str += queryStr
            if (get.requestBody) {
                console.log('warning: get is not support requestBody')
            }
            const responses = buildResponse(get.responses)
            str += buildRequest(requestPath, path, 'get', responses, interfaceName, !!pathStr || !!queryStr)
        }
        if (post) {
            // 拼接生成接口名字
            const requestPath = splitPath('Post', path)
            // 生成DTO名字
            const interfaceName = requestPath + 'Option'
            // 生成注释
            str += buildDescription(post.tags, post.summary, post.description)
            const [pathParamsChild, queryParamsChild] = getParameters(post.parameters)
            // path 的dto/vo
            const pathStr = buildPathOption([...pathParams, ...pathParamsChild], interfaceName)
            str += pathStr
            // query 的dto/vo
            const queryStr = buildQueryOption([...queryParams, ...queryParamsChild], interfaceName)
            str += queryStr
            const bodyStr = buildBodyOption(post.requestBody, interfaceName)
            str += bodyStr
            const responses = buildResponse(post.responses)
            str += buildRequest(requestPath, path, 'post', responses, interfaceName, !!pathStr || !!queryStr || !!bodyStr)

        }
        if (put) {
            // 拼接生成接口名字
            const requestPath = splitPath('Put', path)
            // 生成DTO名字
            const interfaceName = requestPath + 'Option'
            // 生成注释
            str += buildDescription(put.tags, put.summary, put.description)
            const [pathParamsChild, queryParamsChild] = getParameters(put.parameters)
            // path 的dto/vo
            const pathStr = buildPathOption([...pathParams, ...pathParamsChild], interfaceName)
            str += pathStr
            // query 的dto/vo
            const queryStr = buildQueryOption([...queryParams, ...queryParamsChild], interfaceName)
            str += queryStr
            const bodyStr = buildBodyOption(put.requestBody, interfaceName)
            str += bodyStr
            const responses = buildResponse(put.responses)
            str += buildRequest(requestPath, path, 'put', responses, interfaceName, !!pathStr || !!queryStr || !!bodyStr)
        }
        if (deleteItem) {
            // 拼接生成接口名字
            const requestPath = splitPath('Delete', path)
            // 生成DTO名字
            const interfaceName = requestPath + 'Option'
            // 生成注释
            str += buildDescription(deleteItem.tags, deleteItem.summary, deleteItem.description)
            const [pathParamsChild, queryParamsChild] = getParameters(deleteItem.parameters)
            // path 的dto/vo
            const pathStr = buildPathOption([...pathParams, ...pathParamsChild], interfaceName)
            str += pathStr
            // query 的dto/vo
            const queryStr = buildQueryOption([...queryParams, ...queryParamsChild], interfaceName)
            str += queryStr
            if (deleteItem.requestBody) {
                console.log('warning: deleteItem is not support requestBody')
            }
            const responses = buildResponse(deleteItem.responses)
            str += buildRequest(requestPath, path, 'delete', responses, interfaceName, !!pathStr || !!queryStr)
        }
        if (options) {
            console.log('options is not supported now')
        }
    })
    writeFileSync(`${config.outputPath}/request.ts`, str);
}

module.exports = transformPaths