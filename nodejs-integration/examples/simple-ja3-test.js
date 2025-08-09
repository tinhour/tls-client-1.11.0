const { createClient } = require('../index');

/**
 * 简单JA3测试 - 使用可靠的JA3指纹
 */
async function simpleJA3Test() {
    console.log('=== 简单JA3功能测试 ===\n');

    try {
        const client = createClient({
            timeout: 15
        });

        // 测试1: 使用标准浏览器配置文件作为对比
        console.log('1. 标准Chrome配置文件测试...');
        const standardResponse = await client.request({
            url: 'https://httpbin.org/headers',
            profile: 'chrome_120'
        });

        if (standardResponse.statusCode === 200) {
            console.log(`✅ 标准配置: ${standardResponse.statusCode} (${standardResponse.requestTime}ms)`);
        } else {
            console.log(`❌ 标准配置失败: ${standardResponse.statusCode}`);
        }

        // 测试2: 使用可靠的Chrome JA3指纹
        console.log('\n2. Chrome JA3指纹测试...');
        const chromeJA3 = "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0";
        
        const ja3Response = await client.requestWithJA3({
            url: 'https://httpbin.org/headers',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, chromeJA3);

        if (ja3Response.statusCode === 200) {
            console.log(`✅ JA3配置: ${ja3Response.statusCode} (${ja3Response.requestTime}ms)`);
            const data = JSON.parse(ja3Response.body);
            console.log(`📨 User-Agent检测: ${data.headers['User-Agent']?.substring(0, 50)}...`);
        } else {
            console.log(`❌ JA3配置失败: ${ja3Response.statusCode}`);
        }

        // 测试3: 使用简化的自定义TLS配置
        console.log('\n3. 简化TLS配置测试...');
        const customTlsConfig = {
            ja3String: chromeJA3,
            alpnProtocols: ["h2", "http/1.1"],
            supportedVersions: ["1.3", "1.2"]
        };

        const customResponse = await client.requestWithCustomTLS({
            url: 'https://httpbin.org/get',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CustomTLS-Test/1.0'
            }
        }, customTlsConfig);

        if (customResponse.statusCode === 200) {
            console.log(`✅ 自定义TLS: ${customResponse.statusCode} (${customResponse.requestTime}ms)`);
            const data = JSON.parse(customResponse.body);
            console.log(`🌐 Origin IP: ${data.origin}`);
        } else {
            console.log(`❌ 自定义TLS失败: ${customResponse.statusCode}`);
        }

        // 测试4: 命令行直接测试
        console.log('\n4. 验证CLI直接调用...');
        console.log('可以手动运行以下命令测试:');
        console.log('');
        console.log(`../build/tls-client -url "https://httpbin.org/get" -ja3 "${chromeJA3}"`);
        console.log('');
        console.log('或者使用自定义TLS配置:');
        console.log('');
        console.log('../build/tls-client -url "https://httpbin.org/get" -custom-tls \'{"ja3String":"' + chromeJA3 + '","alpnProtocols":["h2","http/1.1"]}\'');

        console.log('\n✅ JA3功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('详细错误:', error);
    }
}

/**
 * 快速验证JA3是否工作
 */
async function quickJA3Verify() {
    console.log('\n=== 快速JA3验证 ===\n');

    try {
        const client = createClient({ timeout: 10 });

        // 使用httpbin.org的简单端点
        const testConfigs = [
            {
                name: '标准配置',
                config: { url: 'https://httpbin.org/get', profile: 'chrome_120' }
            },
            {
                name: 'JA3配置',
                config: { url: 'https://httpbin.org/get' },
                ja3: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"
            }
        ];

        for (const test of testConfigs) {
            try {
                console.log(`🔍 测试 ${test.name}...`);
                
                let response;
                if (test.ja3) {
                    response = await client.requestWithJA3(test.config, test.ja3);
                } else {
                    response = await client.request(test.config);
                }

                if (response.statusCode === 200) {
                    console.log(`  ✅ 成功: ${response.statusCode} (${response.requestTime}ms, ${response.size} bytes)`);
                } else {
                    console.log(`  ❌ 失败: ${response.statusCode}`);
                    if (response.error) {
                        console.log(`  错误: ${response.error}`);
                    }
                }
            } catch (error) {
                console.log(`  ❌ 异常: ${error.message}`);
            }
            console.log('');
        }

        console.log('✅ 快速验证完成！');
        
    } catch (error) {
        console.error('❌ 验证失败:', error.message);
    }
}

// 运行测试
async function runTests() {
    await quickJA3Verify();
    await simpleJA3Test();
    
    console.log('\n🎉 所有JA3测试执行完成！');
    console.log('\n💡 提示:');
    console.log('- 如果某些JA3指纹失败，可能是指纹格式不正确');
    console.log('- 网络问题也可能导致连接失败');
    console.log('- 可以使用标准浏览器配置文件作为替代方案');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    simpleJA3Test,
    quickJA3Verify,
    runTests
};
