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

function getCallerFilePath() {
    // 通过抛出一个错误并捕获它来获取调用栈
    try {
        throw new Error();
    } catch (error) {
        // 获取错误堆栈信息，并分割成数组
        const stack = error.stack.split('\n');
        // 假设当前函数是被另一个文件中的函数调用的，
        // 那么第三行（索引为2）通常是调用者的信息
        const callerLine = stack[2];
        // 使用正则表达式匹配文件路径
        const match = callerLine.match(/at\s.*\((.*):\d+:\d+\)/);
        if (match && match[1]) {
            return match[1]; // 返回文件路径
        }
    }
    return null; // 如果没有找到合适的路径，则返回null
}

// 示例：在另一个文件中调用此函数
console.log(getCallerFilePath());

module.exports = {
    splitType,
    getType,
    splitPath,
    hanldeTransformChinese,
}