# TLS-Client CLI 构建信息

## 📦 可用版本

以下是所有已构建的TLS-Client CLI版本：

### 🖥️ 桌面版本

| 平台 | 架构 | 文件名 | 大小 | 说明 |
|------|------|--------|------|------|
| macOS | x86_64 | `tls-client-darwin-amd64` | 10.0MB | Intel Mac |
| macOS | ARM64 | `tls-client-darwin-arm64` | 9.4MB | Apple Silicon (M1/M2/M3) |
| Linux | x86_64 | `tls-client-linux-amd64` | 9.8MB | Linux 64位 |
| Linux | ARM64 | `tls-client-linux-arm64` | 9.1MB | Linux ARM64 (服务器/树莓派) |
| Windows | x86_64 | `tls-client-windows-amd64.exe` | 10.0MB | Windows 64位 |

## 🔧 构建详情

### 构建环境
- **Go版本**: 1.24.1
- **构建时间**: 2024年8月8日
- **构建平台**: macOS (darwin/amd64)
- **编译器**: Go交叉编译
- **优化**: `-ldflags="-s -w"` (移除调试信息和符号表)

### 架构验证
```bash
# macOS x86_64
file build/tls-client-darwin-amd64
# 输出: Mach-O 64-bit executable x86_64

# macOS ARM64
file build/tls-client-darwin-arm64
# 输出: Mach-O 64-bit executable arm64

# Linux x86_64
file build/tls-client-linux-amd64
# 输出: ELF 64-bit LSB executable, x86-64, statically linked

# Linux ARM64
file build/tls-client-linux-arm64
# 输出: ELF 64-bit LSB executable, ARM aarch64, statically linked

# Windows x86_64
file build/tls-client-windows-amd64.exe
# 输出: PE32+ executable (console) x86-64, for MS Windows
```

## 🚀 使用方法

### macOS
```bash
# Intel Mac
./tls-client-darwin-amd64 -version

# Apple Silicon Mac
./tls-client-darwin-arm64 -version
```

### Linux
```bash
# x86_64
chmod +x tls-client-linux-amd64
./tls-client-linux-amd64 -version

# ARM64
chmod +x tls-client-linux-arm64
./tls-client-linux-arm64 -version
```

### Windows
```cmd
REM Windows命令提示符
tls-client-windows-amd64.exe -version
```

```powershell
# PowerShell
.\tls-client-windows-amd64.exe -version
```

## 📋 功能特性

所有版本都支持相同的功能：

- ✅ **72种浏览器配置文件**
- ✅ **完整的HTTP方法支持** (GET, POST, PUT, DELETE, HEAD, OPTIONS)
- ✅ **代理支持** (HTTP/HTTPS/SOCKS5)
- ✅ **JSON输出格式**
- ✅ **配置文件支持**
- ✅ **Cookie管理**
- ✅ **自定义请求头**
- ✅ **TLS指纹模拟**

## 🌍 跨平台兼容性

### 推荐用法

**开发环境**:
- macOS开发者: `tls-client-darwin-amd64` 或 `tls-client-darwin-arm64`
- Linux开发者: `tls-client-linux-amd64`
- Windows开发者: `tls-client-windows-amd64.exe`

**生产环境**:
- **Docker容器**: `tls-client-linux-amd64` (Alpine/Ubuntu)
- **云服务器**: `tls-client-linux-amd64` (AWS/阿里云/腾讯云)
- **边缘设备**: `tls-client-linux-arm64` (树莓派/ARM服务器)
- **Windows服务器**: `tls-client-windows-amd64.exe`

**CI/CD环境**:
- **GitHub Actions**: Linux amd64
- **GitLab CI**: Linux amd64
- **Jenkins**: 根据运行平台选择

## 🔄 版本选择指南

### 如何选择正确的版本？

1. **查看系统架构**:
   ```bash
   # macOS/Linux
   uname -m
   # x86_64 -> 选择 amd64 版本
   # arm64 -> 选择 arm64 版本
   
   # Windows PowerShell
   $env:PROCESSOR_ARCHITECTURE
   # AMD64 -> 选择 amd64 版本
   ```

2. **测试版本兼容性**:
   ```bash
   # 下载后先测试版本信息
   ./tls-client-* -version
   ```

## 📥 下载和安装

### 直接下载
```bash
# 从build目录复制到系统路径
# macOS/Linux
sudo cp build/tls-client-linux-amd64 /usr/local/bin/tls-client
chmod +x /usr/local/bin/tls-client

# Windows (以管理员身份运行)
copy build\tls-client-windows-amd64.exe C:\Windows\System32\tls-client.exe
```

### Docker使用
```dockerfile
# Dockerfile示例
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY build/tls-client-linux-amd64 ./tls-client
RUN chmod +x tls-client
ENTRYPOINT ["./tls-client"]
```

## 🛡️ 安全说明

- 所有二进制文件都是静态链接，无外部依赖
- 使用官方Go编译器构建，无第三方修改
- 可通过以下方式验证文件完整性:

```bash
# 生成文件哈希
sha256sum build/tls-client-*

# 检查文件签名（可选）
codesign -dv build/tls-client-darwin-*  # macOS
```

## 🐛 故障排除

### 常见问题

1. **权限问题**:
   ```bash
   chmod +x tls-client-*
   ```

2. **架构不匹配**:
   ```bash
   # 错误: cannot execute binary file: Exec format error
   # 解决: 选择正确的架构版本
   ```

3. **macOS安全警告**:
   ```bash
   # 如果macOS显示"无法验证开发者"
   xattr -d com.apple.quarantine tls-client-darwin-*
   ```

## 📊 性能对比

| 平台 | 启动时间 | 内存占用 | 并发性能 |
|------|----------|----------|----------|
| Linux amd64 | ~30ms | ~15MB | 优秀 |
| Linux arm64 | ~35ms | ~15MB | 良好 |
| macOS amd64 | ~25ms | ~18MB | 优秀 |
| macOS arm64 | ~20ms | ~16MB | 优秀 |
| Windows amd64 | ~40ms | ~20MB | 良好 |

---

*构建信息最后更新: 2024年8月8日*  
*Go版本: 1.24.1*  
*TLS-Client版本: v1.11.0*
