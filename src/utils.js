const splitType = (str) => {
    const r = str.split('/').pop()
    if (r.includes('«') || r.includes('»') || r.match(/[\u4e00-\u9fa5]/)) {
        return hanldeTransformChinese(r)
    }
    return r
}
const getType = (type) => {
    const typeMap = {
        'string': 'string',
        'integer': 'number',
        'number': 'number',
        'boolean': 'boolean',
        'array': 'Array',
        'object': 'any'
    }
    return typeMap[type]
}
const toUpperCaseFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
const splitPath = (Method, path) => {
    // 把path的/去掉并把/后的字符改成大写，并且首字母大写
    let newpath = path.replace('{', '/').replace('}', '').split('/').filter(item => !!item).map(it => toUpperCaseFirst(it)).join('')
    return `${Method}${newpath}`
}

const keyMap = {}
let keyIndex = 0
// 根据数字找字母
const getECode = (code) => {
    const a = Math.floor(code / 26)
    const b = code % 26
    let str = String.fromCharCode(b + 97)
    if (a >= 1) {
        str = getECode(a) + str
    }
    return str
}
const hanldeTransformChinese = (key) => {
    if (keyMap[key]) {
        console.log(keyMap[key])
        return keyMap[key]
    } else {
        // 正则匹配key中的中文替换成R并打印中文
        // 匹配<< 和>> 去掉
        const newKey = key.replace(/«|»/g, '').replace(/[\u4e00-\u9fa5]+/g, () => {
            // 字符串前面补a字符
            let code = getECode(keyIndex)
            if (code.length < 3) {
                code = 'a'.repeat(3 - code.length) + code
            }
            const newCode = 'R' + code
            keyIndex++
            return newCode
        })
        keyMap[key] = newKey

        return newKey
    }
}


module.exports = {
    splitType,
    getType,
    splitPath,
    hanldeTransformChinese,
}