const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 添加开发服务器配置
  devServer: {
    port: 8089, // 设置端口号为8089
    open: true, // 可选配置，启动后自动打开浏览器
    // 其他可能需要的配置
    // host: '0.0.0.0', // 允许外部访问
    // https: false, // 是否启用https
  }
})
