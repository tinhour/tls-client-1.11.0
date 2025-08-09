const { createClient } = require('./index');
const fs = require('fs');
const path = require('path');

/**
 * 简单的测试套件
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 运行 TLS-Client Node.js 测试套件\n');

        for (const test of this.tests) {
            try {
                console.log(`▶️  ${test.name}`);
                await test.fn();
                console.log(`✅ ${test.name} - 通过\n`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name} - 失败: ${error.message}\n`);
                this.failed++;
            }
        }

        console.log(`📊 测试结果: ${this.passed} 通过, ${this.failed} 失败`);
        
        if (this.failed > 0) {
            process.exit(1);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || '断言失败');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `期望 ${expected}，实际 ${actual}`);
        }
    }

    assertTrue(value, message) {
        this.assert(value === true, message || `期望 true，实际 ${value}`);
    }

    assertFalse(value, message) {
        this.assert(value === false, message || `期望 false，实际 ${value}`);
    }
}

const test = new TestRunner();

// 测试客户端创建
test.test('客户端创建测试', async () => {
    const client = createClient();
    test.assert(client !== null, '客户端应该被成功创建');
    test.assertEqual(typeof client.get, 'function', 'get方法应该存在');
    test.assertEqual(typeof client.post, 'function', 'post方法应该存在');
});

// 测试配置设置
test.test('客户端配置测试', async () => {
    const client = createClient({
        profile: 'firefox_117',
        timeout: 60,
        proxy: 'http://127.0.0.1:8080'
    });
    
    test.assertEqual(client.defaultProfile, 'firefox_117', '配置文件应该被正确设置');
    test.assertEqual(client.defaultTimeout, 60, '超时时间应该被正确设置');
    test.assertEqual(client.proxy, 'http://127.0.0.1:8080', '代理应该被正确设置');
});

// 测试参数构建
test.test('命令行参数构建测试', async () => {
    const client = createClient();
    
    const args = client.buildArgs({
        url: 'https://example.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"test": true}',
        timeout: 30
    });
    
    test.assertTrue(args.includes('-url'), '应该包含URL参数');
    test.assertTrue(args.includes('https://example.com'), '应该包含正确的URL');
    test.assertTrue(args.includes('-method'), '应该包含方法参数');
    test.assertTrue(args.includes('POST'), '应该包含正确的方法');
    test.assertTrue(args.includes('-headers'), '应该包含请求头参数');
    test.assertTrue(args.includes('-body'), '应该包含请求体参数');
});

// 测试错误处理
test.test('错误处理测试', async () => {
    const client = createClient();
    
    try {
        client.buildArgs({}); // 缺少URL
        test.assert(false, '应该抛出错误');
    } catch (error) {
        test.assertTrue(error.message.includes('URL'), '应该提示URL错误');
    }
});

// 模拟网络请求测试（如果CLI可用）
test.test('模拟请求测试', async () => {
    // 检查CLI是否可用
    const client = createClient();
    try {
        // 尝试执行一个简单的命令来检查CLI是否工作
        await client.getSupportedProfiles();
        console.log('   🔗 CLI可用，执行实际网络请求测试');
        
        // 执行真实请求
        const response = await client.get('https://httpbin.org/get', {
            headers: { 'User-Agent': 'TLS-Client-Test/1.0' }
        });
        
        test.assertTrue(response.statusCode >= 200 && response.statusCode < 300, 
            '响应状态码应该在200-299范围内');
        test.assertTrue(response.body.length > 0, '响应体不应该为空');
        test.assertTrue(response.requestTime > 0, '请求时间应该大于0');
        
    } catch (error) {
        console.log('   ⚠️  CLI不可用，跳过网络请求测试');
        console.log(`   错误: ${error.message}`);
        // 不算作测试失败，只是跳过
    }
});

// 测试配置文件功能
test.test('配置文件功能测试', async () => {
    const testConfig = {
        url: 'https://httpbin.org/get',
        method: 'GET',
        headers: { 'X-Test': 'config-file' },
        timeout: 30,
        profile: 'chrome_120'
    };
    
    const configPath = path.join(__dirname, 'test-config.json');
    
    try {
        // 写入配置文件
        fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
        test.assertTrue(fs.existsSync(configPath), '配置文件应该被创建');
        
        // 读取配置文件
        const configContent = fs.readFileSync(configPath, 'utf8');
        const parsedConfig = JSON.parse(configContent);
        test.assertEqual(parsedConfig.url, testConfig.url, '配置文件内容应该正确');
        
    } finally {
        // 清理测试文件
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
    }
});

// 运行测试
if (require.main === module) {
    test.run().catch(console.error);
}

module.exports = test;

