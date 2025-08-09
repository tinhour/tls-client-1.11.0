const { createClient } = require('../index');
const fs = require('fs');
const path = require('path');

/**
 * 配置文件使用示例
 */
async function configFileExample() {
    console.log('=== TLS-Client 配置文件使用示例 ===\n');

    try {
        const client = createClient();

        // 创建示例配置文件
        const configDir = path.join(__dirname, 'configs');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // GET请求配置
        const getConfig = {
            url: 'https://httpbin.org/get',
            method: 'GET',
            headers: {
                'User-Agent': 'TLS-Client-Config-Example/1.0',
                'Accept': 'application/json',
                'X-Custom-Header': 'Config-File-Test'
            },
            timeout: 30,
            profile: 'chrome_120',
            followRedirects: true
        };

        const getConfigPath = path.join(configDir, 'get-request.json');
        fs.writeFileSync(getConfigPath, JSON.stringify(getConfig, null, 2));

        console.log('1. 使用配置文件执行GET请求...');
        console.log('配置文件路径:', getConfigPath);
        
        const getResponse = await client.requestFromConfig(getConfigPath);
        console.log('GET响应状态:', getResponse.statusCode);
        console.log('GET响应耗时:', getResponse.requestTime, 'ms\n');

        // POST请求配置
        const postConfig = {
            url: 'https://httpbin.org/post',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'TLS-Client-Config-Example/1.0',
                'X-Request-Source': 'config-file'
            },
            body: JSON.stringify({
                message: 'Hello from config file!',
                timestamp: new Date().toISOString(),
                source: 'TLS-Client Node.js Config Example'
            }),
            timeout: 30,
            profile: 'firefox_117',
            followRedirects: true
        };

        const postConfigPath = path.join(configDir, 'post-request.json');
        fs.writeFileSync(postConfigPath, JSON.stringify(postConfig, null, 2));

        console.log('2. 使用配置文件执行POST请求...');
        console.log('配置文件路径:', postConfigPath);
        
        const postResponse = await client.requestFromConfig(postConfigPath);
        console.log('POST响应状态:', postResponse.statusCode);
        console.log('POST响应耗时:', postResponse.requestTime, 'ms\n');

        // 代理请求配置（注释掉的示例）
        const proxyConfig = {
            url: 'https://httpbin.org/ip',
            method: 'GET',
            headers: {
                'User-Agent': 'TLS-Client-Proxy-Example/1.0'
            },
            timeout: 30,
            profile: 'safari_16_0',
            // proxy: 'http://127.0.0.1:8080', // 取消注释以启用代理
            followRedirects: true
        };

        const proxyConfigPath = path.join(configDir, 'proxy-request.json');
        fs.writeFileSync(proxyConfigPath, JSON.stringify(proxyConfig, null, 2));

        console.log('3. 创建了代理请求配置文件（需要启用代理后使用）');
        console.log('代理配置文件路径:', proxyConfigPath);

        // 显示配置文件内容
        console.log('\n4. 配置文件示例:');
        console.log('GET请求配置:');
        console.log(JSON.stringify(getConfig, null, 2));
        
        console.log('\nPOST请求配置:');
        console.log(JSON.stringify(postConfig, null, 2));

        console.log('\n✅ 配置文件示例执行完成！');
        console.log(`📁 配置文件保存在: ${configDir}`);
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

/**
 * 批量请求示例
 */
async function batchRequestExample() {
    console.log('\n=== 批量请求配置文件示例 ===\n');

    try {
        const client = createClient();

        // 创建多个请求配置
        const requests = [
            {
                name: 'httpbin-get',
                config: {
                    url: 'https://httpbin.org/get',
                    method: 'GET',
                    headers: { 'X-Test': 'batch-1' },
                    profile: 'chrome_120'
                }
            },
            {
                name: 'httpbin-status',
                config: {
                    url: 'https://httpbin.org/status/200',
                    method: 'GET',
                    headers: { 'X-Test': 'batch-2' },
                    profile: 'firefox_117'
                }
            },
            {
                name: 'httpbin-headers',
                config: {
                    url: 'https://httpbin.org/headers',
                    method: 'GET',
                    headers: { 'X-Test': 'batch-3' },
                    profile: 'safari_16_0'
                }
            }
        ];

        console.log('执行批量请求...');
        const startTime = Date.now();

        const results = [];
        for (const request of requests) {
            try {
                const configPath = path.join(__dirname, 'configs', `${request.name}.json`);
                fs.writeFileSync(configPath, JSON.stringify(request.config, null, 2));
                
                const response = await client.requestFromConfig(configPath);
                results.push({
                    name: request.name,
                    status: 'success',
                    statusCode: response.statusCode,
                    time: response.requestTime,
                    size: response.size
                });
                
                console.log(`✓ ${request.name}: ${response.statusCode} (${response.requestTime}ms)`);
                
            } catch (error) {
                results.push({
                    name: request.name,
                    status: 'error',
                    error: error.message
                });
                console.log(`✗ ${request.name}: ${error.message}`);
            }
        }

        const totalTime = Date.now() - startTime;
        
        console.log('\n批量请求结果汇总:');
        console.log(`总耗时: ${totalTime}ms`);
        console.log(`成功: ${results.filter(r => r.status === 'success').length}`);
        console.log(`失败: ${results.filter(r => r.status === 'error').length}`);

        const successResults = results.filter(r => r.status === 'success');
        if (successResults.length > 0) {
            const avgTime = successResults.reduce((sum, r) => sum + r.time, 0) / successResults.length;
            console.log(`平均响应时间: ${avgTime.toFixed(2)}ms`);
        }

        console.log('\n✅ 批量请求示例执行完成！');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

// 运行配置文件示例
async function runConfigExamples() {
    await configFileExample();
    await batchRequestExample();
    
    console.log('\n🎉 所有配置文件示例执行完成！');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runConfigExamples().catch(console.error);
}

module.exports = {
    configFileExample,
    batchRequestExample,
    runConfigExamples
};

