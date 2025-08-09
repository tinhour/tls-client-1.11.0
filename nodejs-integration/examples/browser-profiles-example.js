const { createClient } = require('../index');

/**
 * 浏览器配置文件对比示例
 */
async function browserProfilesComparison() {
    console.log('=== 浏览器配置文件对比示例 ===\n');

    // 定义不同的浏览器配置
    const browsers = [
        { name: 'Chrome 120', profile: 'chrome_120', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        { name: 'Chrome 103', profile: 'chrome_103', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36' },
        { name: 'Firefox 117', profile: 'firefox_117', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0' },
        { name: 'Firefox 120', profile: 'firefox_120', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0' },
        { name: 'Safari 16.0', profile: 'safari_16_0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15' },
        { name: 'Opera 91', profile: 'opera_91', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/91.0.4516.106' }
    ];

    try {
        console.log('测试不同浏览器配置的TLS指纹...\n');

        for (const browser of browsers) {
            try {
                console.log(`🔍 测试 ${browser.name}...`);
                
                const client = createClient({
                    profile: browser.profile,
                    timeout: 30
                });

                // 请求TLS指纹检测服务
                const response = await client.get('https://tls.peet.ws/api/all', {
                    headers: {
                        'User-Agent': browser.userAgent,
                        'Accept': 'application/json'
                    }
                });

                if (response.statusCode === 200) {
                    const data = JSON.parse(response.body);
                    console.log(`  JA3 Hash: ${data.tls.ja3_hash}`);
                    console.log(`  TLS Version: ${data.tls.tls_version_negotiated}`);
                    console.log(`  Cipher Suite: ${data.tls.ciphers[0] || 'N/A'}`);
                    console.log(`  HTTP Version: ${data.http_version}`);
                    console.log(`  请求耗时: ${response.requestTime}ms`);
                } else {
                    console.log(`  ❌ 请求失败: ${response.statusCode}`);
                }
                
            } catch (error) {
                console.log(`  ❌ 错误: ${error.message}`);
            }
            
            console.log(''); // 空行分隔
        }

        console.log('✅ 浏览器配置文件对比完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

/**
 * 移动端配置文件示例
 */
async function mobileProfilesExample() {
    console.log('\n=== 移动端配置文件示例 ===\n');

    const mobileProfiles = [
        { name: 'Safari iOS 17.0', profile: 'safari_ios_17_0', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
        { name: 'Safari iOS 18.0', profile: 'safari_ios_18_0', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
        { name: 'Nike iOS', profile: 'nike_ios_mobile', userAgent: 'Nike/7.8.0 (iPhone; iOS 17.0; Scale/3.00)' },
        { name: 'Nike Android', profile: 'nike_android_mobile', userAgent: 'Nike/4.137.1 (Android 13; Samsung SM-G998B)' },
        { name: 'Zalando iOS', profile: 'zalando_ios_mobile', userAgent: 'Zalando/5.89.0 (iPhone; iOS 17.0; Scale/3.00)' },
        { name: 'Zalando Android', profile: 'zalando_android_mobile', userAgent: 'Zalando/24.5.1 (Android 13; Samsung SM-G998B)' }
    ];

    try {
        console.log('测试移动端配置文件...\n');

        for (const mobile of mobileProfiles) {
            try {
                console.log(`📱 测试 ${mobile.name}...`);
                
                const client = createClient({
                    profile: mobile.profile,
                    timeout: 20
                });

                // 测试User-Agent检测
                const response = await client.get('https://httpbin.org/user-agent', {
                    headers: {
                        'User-Agent': mobile.userAgent
                    }
                });

                if (response.statusCode === 200) {
                    const data = JSON.parse(response.body);
                    console.log(`  User-Agent: ${data['user-agent']}`);
                    console.log(`  请求耗时: ${response.requestTime}ms`);
                    console.log(`  ✅ 成功`);
                } else {
                    console.log(`  ❌ 请求失败: ${response.statusCode}`);
                }
                
            } catch (error) {
                console.log(`  ❌ 错误: ${error.message}`);
            }
            
            console.log(''); // 空行分隔
        }

        console.log('✅ 移动端配置文件测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

/**
 * 高级配置文件使用示例
 */
async function advancedProfilesExample() {
    console.log('\n=== 高级配置文件使用示例 ===\n');

    try {
        // Cloudflare绕过配置
        console.log('🛡️  测试Cloudflare绕过配置...');
        const cloudscraper = createClient({
            profile: 'cloudscraper',
            timeout: 30
        });

        const cfResponse = await cloudscraper.get('https://httpbin.org/get', {
            headers: {
                'User-Agent': 'CloudScraper/1.2.60'
            }
        });

        console.log(`Cloudflare绕过测试: ${cfResponse.statusCode === 200 ? '✅ 成功' : '❌ 失败'}`);
        console.log(`请求耗时: ${cfResponse.requestTime}ms\n`);

        // OkHttp Android配置
        console.log('🤖 测试OkHttp Android配置...');
        const okhttp = createClient({
            profile: 'okhttp4_android_11',
            timeout: 30
        });

        const okhttpResponse = await okhttp.get('https://httpbin.org/get', {
            headers: {
                'User-Agent': 'okhttp/4.9.3'
            }
        });

        console.log(`OkHttp Android测试: ${okhttpResponse.statusCode === 200 ? '✅ 成功' : '❌ 失败'}`);
        console.log(`请求耗时: ${okhttpResponse.requestTime}ms\n`);

        // 配置文件轮换示例
        console.log('🔄 配置文件轮换示例...');
        const profiles = ['chrome_120', 'firefox_117', 'safari_16_0', 'opera_91'];
        
        for (let i = 0; i < profiles.length; i++) {
            const client = createClient({
                profile: profiles[i],
                timeout: 15
            });

            const response = await client.get('https://httpbin.org/headers');
            console.log(`轮换 ${profiles[i]}: ${response.statusCode === 200 ? '✅ 成功' : '❌ 失败'} (${response.requestTime}ms)`);
        }

        console.log('\n✅ 高级配置文件示例完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

/**
 * 性能对比示例
 */
async function performanceComparison() {
    console.log('\n=== 配置文件性能对比 ===\n');

    const testProfiles = [
        'chrome_120',
        'chrome_103', 
        'firefox_117',
        'safari_16_0',
        'nike_ios_mobile',
        'okhttp4_android_11'
    ];

    try {
        console.log('执行性能对比测试...\n');

        const results = [];

        for (const profile of testProfiles) {
            const times = [];
            
            for (let i = 0; i < 3; i++) {
                try {
                    const client = createClient({
                        profile: profile,
                        timeout: 15
                    });

                    const startTime = Date.now();
                    const response = await client.get('https://httpbin.org/get');
                    const endTime = Date.now();

                    if (response.statusCode === 200) {
                        times.push(endTime - startTime);
                    }
                } catch (error) {
                    console.log(`${profile} 第${i+1}次测试失败: ${error.message}`);
                }
            }

            if (times.length > 0) {
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                results.push({ profile, avgTime, tests: times.length });
            }
        }

        // 排序并显示结果
        results.sort((a, b) => a.avgTime - b.avgTime);

        console.log('性能排名 (平均响应时间):');
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.profile}: ${result.avgTime.toFixed(2)}ms (${result.tests}次测试)`);
        });

        console.log('\n✅ 性能对比完成！');
        
    } catch (error) {
        console.error('❌ 性能测试失败:', error.message);
    }
}

// 运行所有示例
async function runAllBrowserExamples() {
    await browserProfilesComparison();
    await mobileProfilesExample();
    await advancedProfilesExample();
    await performanceComparison();
    
    console.log('\n🎉 所有浏览器配置文件示例执行完成！');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runAllBrowserExamples().catch(console.error);
}

module.exports = {
    browserProfilesComparison,
    mobileProfilesExample,
    advancedProfilesExample,
    performanceComparison,
    runAllBrowserExamples
};
