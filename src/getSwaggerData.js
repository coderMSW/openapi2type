const { request } = require('http');
const getSwaggerData = (swaggerPath) => {
    return new Promise((resolve, reject) => {
        // 发起请求
        const req = request(swaggerPath, (res) => {
            // console.log(`状态码: ${res.statusCode}`);

            // 用于累积接收到的数据
            let responseData = '';

            // 接收数据
            res.on('data', (d) => {
                responseData += d;
            });

            // 数据接收完毕，处理结果
            res.on('end', () => {
                console.log('● 接收数据成功');
                resolve(JSON.parse(responseData));
                // 在这里可以对 responseData 进行其他处理，比如解析JSON等
            });
            req.on('error', (error) => {
                throw error;
            });
        });

        // 处理错误
        req.on('error', (error) => {
            console.error(error);
            reject(error);
        });

        // 结束请求
        req.end();
    });
};
module.exports = getSwaggerData;
