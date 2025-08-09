const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * TLS客户端Node.js包装器
 * 提供简单易用的API来调用TLS-Client CLI工具
 */
class TLSClient {
    constructor(options = {}) {
        // CLI可执行文件路径
        this.binaryPath = options.binaryPath || this.findBinary();
        this.defaultTimeout = options.timeout || 30;
        this.defaultProfile = options.profile || 'chrome_120';
        this.proxy = options.proxy || null;
        this.followRedirects = options.followRedirects !== false;
        this.insecureSkipTLS = options.insecureSkipTLS || false;
    }

    /**
     * 查找CLI可执行文件
     */
    findBinary() {
        const possiblePaths = [
            path.join(__dirname, '..', 'build', 'tls-client-windows-x86_64.exe'),
            path.join(__dirname, '..', 'build', 'tls-client.exe'),
            path.join(__dirname, 'tls-client'),
            path.join(__dirname, 'tls-client.exe'),
            'tls-client' // 假设在PATH中
        ];

        for (const binaryPath of possiblePaths) {
            if (fs.existsSync(binaryPath)) {
                return binaryPath;
            }
        }

        throw new Error('未找到tls-client可执行文件，请先构建或指定正确的路径');
    }

    /**
     * 执行HTTP GET请求
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应对象
     */
    async get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    /**
     * 执行HTTP POST请求
     * @param {string} url - 请求URL
     * @param {Object|string} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应对象
     */
    async post(url, data, options = {}) {
        const body = typeof data === 'string' ? data : JSON.stringify(data);
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        return this.request({
            url,
            method: 'POST',
            body,
            headers,
            ...options
        });
    }

    /**
     * 执行HTTP PUT请求
     * @param {string} url - 请求URL
     * @param {Object|string} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应对象
     */
    async put(url, data, options = {}) {
        const body = typeof data === 'string' ? data : JSON.stringify(data);
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        return this.request({
            url,
            method: 'PUT',
            body,
            headers,
            ...options
        });
    }

    /**
     * 执行HTTP DELETE请求
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应对象
     */
    async delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }

    /**
     * 执行通用HTTP请求
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应对象
     */
    async request(config) {
        return new Promise((resolve, reject) => {
            // 构建命令行参数
            const args = this.buildArgs(config);
            
            // 执行CLI命令
            const child = spawn(this.binaryPath, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`CLI执行失败，退出码: ${code}, 错误: ${stderr}`));
                    return;
                }

                try {
                    // 从输出中提取JSON部分（可能有警告信息在前面）
                    let jsonOutput = stdout.trim();
                    
                    // 如果输出包含多行，取最后一行作为JSON
                    const lines = jsonOutput.split('\n').filter(line => line.trim());
                    if (lines.length > 1) {
                        // 查找包含JSON的行（通常以{开始）
                        const jsonLine = lines.find(line => line.trim().startsWith('{'));
                        if (jsonLine) {
                            jsonOutput = jsonLine.trim();
                        } else {
                            jsonOutput = lines[lines.length - 1].trim();
                        }
                    }
                    
                    const response = JSON.parse(jsonOutput);
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    reject(new Error(`解析响应失败: ${error.message}, 输出: ${stdout}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`启动CLI失败: ${error.message}`));
            });
        });
    }

    /**
     * 使用配置文件执行请求
     * @param {string} configPath - 配置文件路径
     * @returns {Promise<Object>} 响应对象
     */
    async requestFromConfig(configPath) {
        return new Promise((resolve, reject) => {
            const child = spawn(this.binaryPath, ['-config', configPath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`CLI执行失败，退出码: ${code}, 错误: ${stderr}`));
                    return;
                }

                try {
                    const response = JSON.parse(stdout);
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    reject(new Error(`解析响应失败: ${error.message}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`启动CLI失败: ${error.message}`));
            });
        });
    }

    /**
     * 获取支持的浏览器配置文件列表
     * @returns {Promise<Array>} 配置文件列表
     */
    async getSupportedProfiles() {
        return new Promise((resolve, reject) => {
            const child = spawn(this.binaryPath, ['-list-profiles'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`CLI执行失败，退出码: ${code}, 错误: ${stderr}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result.supportedProfiles || []);
                } catch (error) {
                    reject(new Error(`解析响应失败: ${error.message}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`启动CLI失败: ${error.message}`));
            });
        });
    }

    /**
     * 使用自定义JA3指纹执行请求
     * @param {Object} config - 请求配置
     * @param {string} ja3String - JA3指纹字符串
     * @returns {Promise<Object>} 响应对象
     */
    async requestWithJA3(config, ja3String) {
        const requestConfig = {
            ...config,
            ja3String: ja3String
        };
        return this.request(requestConfig);
    }

    /**
     * 使用自定义TLS配置执行请求
     * @param {Object} config - 请求配置
     * @param {Object} customTlsConfig - 自定义TLS配置
     * @returns {Promise<Object>} 响应对象
     */
    async requestWithCustomTLS(config, customTlsConfig) {
        const requestConfig = {
            ...config,
            customTlsConfig: customTlsConfig
        };
        return this.request(requestConfig);
    }

    /**
     * 构建命令行参数
     * @param {Object} config - 请求配置
     * @returns {Array} 命令行参数数组
     */
    buildArgs(config) {
        const args = [];

        // URL（必需）
        if (!config.url) {
            throw new Error('URL是必需的');
        }
        args.push('-url', config.url);

        // HTTP方法
        if (config.method) {
            args.push('-method', config.method.toUpperCase());
        }

        // 请求头
        if (config.headers && Object.keys(config.headers).length > 0) {
            args.push('-headers', JSON.stringify(config.headers));
        }

        // 请求体
        if (config.body) {
            args.push('-body', config.body);
        }

        // 超时
        const timeout = config.timeout || this.defaultTimeout;
        args.push('-timeout', timeout.toString());

        // 浏览器配置文件
        const profile = config.profile || this.defaultProfile;
        args.push('-profile', profile);

        // 代理
        const proxy = config.proxy || this.proxy;
        if (proxy) {
            args.push('-proxy', proxy);
        }

        // 重定向
        const followRedirects = config.followRedirects !== undefined ? 
            config.followRedirects : this.followRedirects;
        if (!followRedirects) {
            args.push('-follow-redirects=false');
        }

        // 跳过TLS验证
        const insecureSkipTLS = config.insecureSkipTLS !== undefined ? 
            config.insecureSkipTLS : this.insecureSkipTLS;
        if (insecureSkipTLS) {
            args.push('-insecure');
        }

        // JA3指纹
        if (config.ja3String) {
            args.push('-ja3', config.ja3String);
        }

        // 自定义TLS配置
        if (config.customTlsConfig) {
            args.push('-custom-tls', JSON.stringify(config.customTlsConfig));
        }

        return args;
    }

    /**
     * 设置代理
     * @param {string} proxy - 代理地址
     */
    setProxy(proxy) {
        this.proxy = proxy;
    }

    /**
     * 设置默认配置文件
     * @param {string} profile - 浏览器配置文件
     */
    setProfile(profile) {
        this.defaultProfile = profile;
    }

    /**
     * 设置默认超时
     * @param {number} timeout - 超时时间（秒）
     */
    setTimeout(timeout) {
        this.defaultTimeout = timeout;
    }
}

// 工厂函数，方便创建客户端实例
function createClient(options = {}) {
    return new TLSClient(options);
}

// 导出
module.exports = {
    TLSClient,
    createClient
};

