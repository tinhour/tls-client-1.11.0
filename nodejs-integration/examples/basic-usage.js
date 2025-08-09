const { createClient } = require('../index');

/**
 * 基本使用示例
 */
async function basicExample() {
    console.log('=== TLS-Client Node.js 基本使用示例 ===\n');

    try {
        // 创建客户端实例
        const client = createClient({
            profile: 'chrome_120',
            timeout: 30
        });

        console.log('1. 执行简单GET请求...');
        const getResponse = await client.get('https://httpbin.org/get', {
            headers: {
                'User-Agent': 'TLS-Client-Node.js/1.11.0',
                'Accept': 'application/json'
            }
        });

        console.log('GET响应状态:', getResponse.statusCode);
        console.log('GET响应大小:', getResponse.size, 'bytes');
        console.log('请求耗时:', getResponse.requestTime, 'ms\n');

        console.log('2. 执行POST请求...');
        const postData = {
            message: 'Hello from TLS-Client Node.js!',
            timestamp: new Date().toISOString(),
            test: true
        };

        const postResponse = await client.post('https://httpbin.org/post', postData, {
            headers: {
                'User-Agent': 'TLS-Client-Node.js/1.11.0'
            }
        });

        console.log('POST响应状态:', postResponse.statusCode);
        console.log('POST响应大小:', postResponse.size, 'bytes');
        console.log('请求耗时:', postResponse.requestTime, 'ms\n');

        console.log('3. 获取支持的浏览器配置文件...');
        const profiles = await client.getSupportedProfiles();
        console.log('支持的配置文件数量:', profiles.length);
        console.log('Chrome配置文件:', profiles.filter(p => p.startsWith('chrome_')).join(', '));
        console.log('Firefox配置文件:', profiles.filter(p => p.startsWith('firefox_')).join(', '));
        console.log('Safari配置文件:', profiles.filter(p => p.startsWith('safari_')).join(', '));
        console.log('移动端配置文件:', profiles.filter(p => p.includes('mobile') || p.includes('android') || p.includes('ios')).join(', '));

        console.log('\n✅ 所有测试通过！');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

/**
 * 高级使用示例
 */
async function advancedExample() {
    console.log('\n=== TLS-Client Node.js 高级使用示例 ===\n');

    try {
        // 创建带代理配置的客户端
        const client = createClient({
            profile: 'firefox_117',
            timeout: 60,
            // proxy: 'http://127.0.0.1:8080', // 取消注释以启用代理
            followRedirects: false
        });

        console.log('1. 使用Firefox配置文件请求...');
        const firefoxResponse = await client.get('https://httpbin.org/user-agent', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:117.0) Gecko/20100101 Firefox/117.0'
            }
        });

        console.log('Firefox请求状态:', firefoxResponse.statusCode);
        console.log('User-Agent验证:', JSON.parse(firefoxResponse.body)['user-agent']);

        console.log('\n2. 处理重定向...');
        const redirectResponse = await client.get('https://httpbin.org/redirect/3');
        console.log('重定向响应状态:', redirectResponse.statusCode);
        console.log('是否为重定向:', redirectResponse.statusCode >= 300 && redirectResponse.statusCode < 400);

        console.log('\n3. 发送复杂请求头...');
        const complexResponse = await client.get('https://httpbin.org/headers', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'X-Custom-Header': 'TLS-Client-Test'
            }
        });

        const responseBody = JSON.parse(complexResponse.body);
        console.log('自定义请求头已发送:', 'X-Custom-Header' in responseBody.headers);

        console.log('\n✅ 高级测试通过！');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

/**
 * 性能测试示例
 */
async function performanceExample() {
    console.log('\n=== TLS-Client Node.js 性能测试示例 ===\n');

    try {
        const client = createClient({
            profile: 'chrome_120',
            timeout: 10
        });

        const urls = [
            'https://httpbin.org/delay/1',
            'https://httpbin.org/delay/2',
            'https://httpbin.org/delay/1'
        ];

        console.log('执行并发请求测试...');
        const startTime = Date.now();

        // 并发执行多个请求
        const promises = urls.map((url, index) => 
            client.get(url, {
                headers: {
                    'X-Request-ID': `req-${index + 1}`
                }
            })
        );

        const responses = await Promise.all(promises);
        const totalTime = Date.now() - startTime;

        console.log(`完成 ${responses.length} 个并发请求，总耗时: ${totalTime}ms`);
        
        responses.forEach((response, index) => {
            console.log(`请求 ${index + 1}: 状态=${response.statusCode}, 耗时=${response.requestTime}ms`);
        });

        const avgTime = responses.reduce((sum, resp) => sum + resp.requestTime, 0) / responses.length;
        console.log(`平均请求耗时: ${avgTime.toFixed(2)}ms`);

        console.log('\n✅ 性能测试通过！');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

// 运行所有示例
async function runAllExamples() {
    await basicExample();
    await advancedExample();
    await performanceExample();
    
    console.log('\n🎉 所有示例执行完成！');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runAllExamples().catch(console.error);
}

module.exports = {
    basicExample,
    advancedExample,
    performanceExample,
    runAllExamples
};

