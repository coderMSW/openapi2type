#### 使用方法

1. 安装依赖：`npm i openapi2type --save-dev`

2. 创建接口文档文件夹，如：`src/api`

3. 创建`api.js`文件

4. 引入依赖并使用暴露的函数

   ```javascript
   // src/api/api.js
   const transform = require("openapi2ts"); //

   transform({
     swaggerPath: "http://swagger-html/doc", // 必填
     namespace: "API", // 生成scchemas的命名空间名称 非必填
     dirname: __dirname, // 获取当前路径，建议填入
     outputPath: "./msw", // 输出路径，非必填，默认为 api文件
     importStatement: "import { requester, AxiosRequestConfig } from './http'", // 引入请求方法和配置类型 必填
     generateRequestFunction: false, // 生成请求函数自定义，建议
   });
   ```

   ```javascript
   // 自定义
   generateRequestFunction(args){
       const { requestName, optionsName, responsesName, path, method, isHasOption } = args
       // 参数
       // requestName // 请求名
       // optionsName // 请求参数名
       // responsesName // 响应参数名
       // path // 请求路径
       // method // 请求方法
       // isHasOption // 是否存在请求参数
       // 返回自定义的请求函数字符串
       // return string
       // 如：
       return `export const ${requestName} = (options: ${optionsName}, config?: AxiosRequestConfig) =>
           requester<${responsesName}> (${path}, { method: ${method}, ...options }, config)`
   }
   ```

5. 可手动 node 执行，也可以在`package.json`中 配置脚本执行程序，如：

   ```json
   "scripts": {
       "api": "node /src/api/api.js"
   }
   // npm run api
   ```
