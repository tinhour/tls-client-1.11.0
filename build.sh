#!/bin/bash

# TLS-Client 构建脚本
# 支持多平台构建

set -e

echo "🔨 开始构建 TLS-Client CLI..."

# 检查Go是否已安装
if ! command -v go &> /dev/null; then
    echo "❌ 错误: Go 未安装"
    echo "请安装 Go 1.19 或更高版本"
    echo "下载地址: https://golang.org/dl/"
    exit 1
fi

# 检查Go版本
GO_VERSION=$(go version | cut -d' ' -f3 | cut -c3-)
echo "📦 使用 Go 版本: $GO_VERSION"

# 创建构建目录
BUILD_DIR="./build"
mkdir -p "$BUILD_DIR"

# 获取当前平台信息
GOOS=$(go env GOOS)
GOARCH=$(go env GOARCH)
echo "🖥️  当前平台: $GOOS/$GOARCH"

# 构建参数
LDFLAGS="-s -w -X main.version=1.11.0 -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
CMD_PATH="./cmd/cli"

# 单平台构建
build_single() {
    local target_os=$1
    local target_arch=$2
    local output_name="tls-client"
    
    if [ "$target_os" = "windows" ]; then
        output_name="tls-client.exe"
    fi
    
    local output_path="$BUILD_DIR/$output_name"
    if [ "$target_os" != "$GOOS" ] || [ "$target_arch" != "$GOARCH" ]; then
        output_path="$BUILD_DIR/tls-client-$target_os-$target_arch"
        if [ "$target_os" = "windows" ]; then
            output_path="$output_path.exe"
        fi
    fi
    
    echo "🔨 构建 $target_os/$target_arch -> $output_path"
    
    GOOS="$target_os" GOARCH="$target_arch" go build \
        -ldflags="$LDFLAGS" \
        -o "$output_path" \
        "$CMD_PATH"
    
    echo "✅ 构建完成: $output_path"
}

# 多平台构建
build_all() {
    echo "🌍 开始多平台构建..."
    
    # 清理之前的构建文件
    rm -rf "$BUILD_DIR"/*
    
    # 构建各个平台
    build_single "linux" "amd64"
    build_single "linux" "arm64"
    build_single "darwin" "amd64"
    build_single "darwin" "arm64"
    build_single "windows" "amd64"
    
    echo ""
    echo "📦 构建完成的文件:"
    ls -la "$BUILD_DIR"/
}

# 检查参数
case "${1:-current}" in
    "current")
        echo "🔨 构建当前平台版本..."
        rm -f "$BUILD_DIR/tls-client" "$BUILD_DIR/tls-client.exe"
        build_single "$GOOS" "$GOARCH"
        ;;
    "all")
        build_all
        ;;
    "linux")
        build_single "linux" "amd64"
        ;;
    "darwin"|"mac"|"macos")
        build_single "darwin" "amd64"
        ;;
    "windows"|"win")
        build_single "windows" "amd64"
        ;;
    "clean")
        echo "🧹 清理构建文件..."
        rm -rf "$BUILD_DIR"
        echo "✅ 清理完成"
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "TLS-Client 构建脚本"
        echo ""
        echo "用法: $0 [目标平台]"
        echo ""
        echo "目标平台:"
        echo "  current    构建当前平台版本 (默认)"
        echo "  all        构建所有支持的平台"
        echo "  linux      构建 Linux 版本"
        echo "  darwin     构建 macOS 版本"
        echo "  windows    构建 Windows 版本"
        echo "  clean      清理构建文件"
        echo "  help       显示此帮助信息"
        echo ""
        echo "示例:"
        echo "  $0              # 构建当前平台"
        echo "  $0 all          # 构建所有平台"
        echo "  $0 linux        # 只构建Linux版本"
        exit 0
        ;;
    *)
        echo "❌ 错误: 未知的目标平台 '$1'"
        echo "运行 '$0 help' 查看可用选项"
        exit 1
        ;;
esac

echo ""
echo "🎉 构建完成！"

# 如果构建了当前平台版本，显示使用提示
if [ -f "$BUILD_DIR/tls-client" ] || [ -f "$BUILD_DIR/tls-client.exe" ]; then
    echo ""
    echo "💡 使用提示:"
    if [ "$GOOS" = "windows" ]; then
        echo "  .\build\tls-client.exe -help"
    else
        echo "  ./build/tls-client -help"
    fi
    echo ""
    echo "或安装到系统路径:"
    if [ "$GOOS" = "windows" ]; then
        echo "  copy build\tls-client.exe C:\Windows\System32\"
    else
        echo "  sudo cp build/tls-client /usr/local/bin/"
    fi
fi
