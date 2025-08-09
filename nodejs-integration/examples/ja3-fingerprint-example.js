const { createClient } = require('../index');

/**
 * JA3指纹自定义示例
 */
async function ja3FingerprintExample() {
    console.log('=== JA3指纹自定义示例 ===\n');

    try {
        const client = createClient({
            timeout: 30
        });

        // 1. 使用简单JA3指纹
        console.log('1. 使用简单JA3指纹...');
        const simpleJA3 = "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0";
        
        const response1 = await client.requestWithJA3({
            url: 'https://tls.peet.ws/api/all',
            headers: {
                'User-Agent': 'CustomJA3-Client/1.0'
            }
        }, simpleJA3);

        console.log(`JA3请求状态: ${response1.statusCode}`);
        if (response1.statusCode === 200) {
            const data = JSON.parse(response1.body);
            console.log(`检测到的JA3: ${data.tls.ja3_hash}`);
            console.log(`TLS版本: ${data.tls.tls_version_negotiated}`);
        }
        console.log('');

        // 2. 使用复杂JA3指纹（模拟Chrome）
        console.log('2. 使用复杂JA3指纹（模拟Chrome）...');
        const chromeJA3 = "771,2570-4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,2570-0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-2570-21,2570-29-23-24,0";
        
        const response2 = await client.requestWithJA3({
            url: 'https://tls.peet.ws/api/all',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, chromeJA3);

        console.log(`Chrome JA3请求状态: ${response2.statusCode}`);
        if (response2.statusCode === 200) {
            const data = JSON.parse(response2.body);
            console.log(`检测到的JA3: ${data.tls.ja3_hash}`);
            // 安全地获取User-Agent
            let userAgent = 'N/A';
            if (data.http1 && data.http1.headers) {
                const uaHeader = data.http1.headers.find(h => 
                    typeof h === 'string' && h.toLowerCase().includes('user-agent')
                );
                if (uaHeader) {
                    userAgent = uaHeader.substring(0, 50) + '...';
                }
            } else if (data.http && data.http.headers) {
                userAgent = data.http.headers['User-Agent'] || 'N/A';
            }
            console.log(`User-Agent: ${userAgent}`);
        }
        console.log('');

        // 3. 使用完整自定义TLS配置
        console.log('3. 使用完整自定义TLS配置...');
        const customTlsConfig = {
            ja3String: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0",
            h2Settings: {
                "HEADER_TABLE_SIZE": 65536,
                "MAX_CONCURRENT_STREAMS": 1000,
                "INITIAL_WINDOW_SIZE": 6291456,
                "MAX_HEADER_LIST_SIZE": 262144
            },
            h2SettingsOrder: [
                "HEADER_TABLE_SIZE",
                "MAX_CONCURRENT_STREAMS",
                "INITIAL_WINDOW_SIZE", 
                "MAX_HEADER_LIST_SIZE"
            ],
            supportedSignatureAlgorithms: [
                "ECDSAWithP256AndSHA256",
                "PSSWithSHA256",
                "PKCS1WithSHA256",
                "ECDSAWithP384AndSHA384",
                "PSSWithSHA384",
                "PKCS1WithSHA384",
                "PSSWithSHA512",
                "PKCS1WithSHA512"
            ],
            supportedVersions: ["GREASE", "1.3", "1.2"],
            keyShareCurves: ["GREASE", "X25519"],
            certCompressionAlgos: ["brotli"],
            alpnProtocols: ["h2", "http/1.1"],
            alpsProtocols: ["h2"],
            pseudoHeaderOrder: [":method", ":authority", ":scheme", ":path"],
            connectionFlow: 15663105
        };

        const response3 = await client.requestWithCustomTLS({
            url: 'https://tls.peet.ws/api/all',
            headers: {
                'User-Agent': 'CustomTLS-Client/1.0'
            }
        }, customTlsConfig);

        console.log(`自定义TLS请求状态: ${response3.statusCode}`);
        if (response3.statusCode === 200) {
            const data = JSON.parse(response3.body);
            console.log(`检测到的JA3: ${data.tls.ja3_hash}`);
            console.log(`HTTP版本: ${data.http_version}`);
        }

        console.log('\n✅ JA3指纹示例完成！');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
}

/**
 * JA3指纹对比示例
 */
async function ja3ComparisonExample() {
    console.log('\n=== JA3指纹对比示例 ===\n');

    const ja3Profiles = [
        {
            name: 'Chrome 120',
            ja3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0",
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        {
            name: 'Firefox 117',
            ja3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0'
        },
        {
            name: 'Simple JA3',
            ja3: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
            userAgent: 'SimpleClient/1.0'
        },
        {
            name: 'Basic TLS',
            ja3: "771,4865-4866,23-65281,29-23,0",
            userAgent: 'BasicTLS/1.0'
        }
    ];

    try {
        const client = createClient({ timeout: 20 });

        console.log('对比不同JA3指纹的效果...\n');

        for (const profile of ja3Profiles) {
            try {
                console.log(`🔍 测试 ${profile.name}...`);
                
                const response = await client.requestWithJA3({
                    url: 'https://httpbin.org/headers',
                    headers: {
                        'User-Agent': profile.userAgent
                    }
                }, profile.ja3);

                if (response.statusCode === 200) {
                    console.log(`  ✅ 状态: ${response.statusCode}`);
                    console.log(`  ⏱️  耗时: ${response.requestTime}ms`);
                    console.log(`  📦 大小: ${response.size} bytes`);
                    
                    const headers = JSON.parse(response.body);
                    const userAgent = headers.headers['User-Agent'] || 'N/A';
                    console.log(`  🌐 User-Agent: ${userAgent.substring(0, 50)}...`);
                } else {
                    console.log(`  ❌ 失败: ${response.statusCode}`);
                }
                
            } catch (error) {
                console.log(`  ❌ 错误: ${error.message}`);
            }
            
            console.log('');
        }

        console.log('✅ JA3对比示例完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

/**
 * 实际应用场景示例
 */
async function realWorldExample() {
    console.log('\n=== 实际应用场景示例 ===\n');

    try {
        const client = createClient();

        // 场景1：绕过基本的浏览器检测
        console.log('场景1: 绕过基本的浏览器检测...');
        const basicBypass = await client.requestWithJA3({
            url: 'https://httpbin.org/headers',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0");

        console.log(`基本绕过结果: ${basicBypass.statusCode === 200 ? '成功' : '失败'}`);

        // 场景2：模拟特定浏览器的API调用
        console.log('\n场景2: 模拟特定浏览器的API调用...');
        const apiCall = await client.requestWithCustomTLS({
            url: 'https://httpbin.org/get',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        }, {
            ja3String: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
            alpnProtocols: ["h2", "http/1.1"],
            supportedVersions: ["1.3", "1.2"]
        });

        console.log(`API调用结果: ${apiCall.statusCode === 200 ? '成功' : '失败'}`);
        console.log(`响应时间: ${apiCall.requestTime}ms`);

        // 场景3：配置文件轮换
        console.log('\n场景3: 配置文件轮换...');
        const ja3Pool = [
            "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
            "771,4865-4866,23-65281-10-11-35-16-5-13-18,29-23,0",
            "771,4865-4866-4867,23-65281-10-11,29-23-24,0"
        ];

        for (let i = 0; i < ja3Pool.length; i++) {
            const response = await client.requestWithJA3({
                url: 'https://httpbin.org/get'
            }, ja3Pool[i]);
            
            console.log(`轮换 ${i + 1}: ${response.statusCode === 200 ? '✅' : '❌'} (${response.requestTime}ms)`);
        }

        console.log('\n✅ 实际应用示例完成！');
        
    } catch (error) {
        console.error('❌ 应用示例失败:', error.message);
    }
}

// 运行所有JA3示例
async function runAllJA3Examples() {
    await ja3FingerprintExample();
    await ja3ComparisonExample();
    await realWorldExample();
    
    console.log('\n🎉 所有JA3指纹示例执行完成！');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runAllJA3Examples().catch(console.error);
}

module.exports = {
    ja3FingerprintExample,
    ja3ComparisonExample,
    realWorldExample,
    runAllJA3Examples
};
