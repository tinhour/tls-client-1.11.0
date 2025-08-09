# TLS-Client CLI 构建脚本

# 变量定义
BINARY_NAME=tls-client
CMD_PATH=./cmd/cli
BUILD_DIR=./build
GO_FLAGS=-ldflags="-s -w"

# 默认目标
.PHONY: all
all: clean build

# 清理构建目录
.PHONY: clean
clean:
	@echo "清理构建目录..."
	@rm -rf $(BUILD_DIR)
	@mkdir -p $(BUILD_DIR)

# 构建当前平台的可执行文件
.PHONY: build
build:
	@echo "构建 $(BINARY_NAME)..."
	@go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)
	@echo "构建完成: $(BUILD_DIR)/$(BINARY_NAME)"

# 构建所有平台的可执行文件
.PHONY: build-all
build-all: clean
	@echo "构建多平台可执行文件..."
	@GOOS=windows GOARCH=amd64 go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe $(CMD_PATH)
	@GOOS=linux GOARCH=amd64 go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(CMD_PATH)
	@GOOS=darwin GOARCH=amd64 go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 $(CMD_PATH)
	@GOOS=darwin GOARCH=arm64 go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 $(CMD_PATH)
	@GOOS=linux GOARCH=arm64 go build $(GO_FLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 $(CMD_PATH)
	@echo "所有平台构建完成！"
	@ls -la $(BUILD_DIR)/

# 安装到系统路径
.PHONY: install
install: build
	@echo "安装 $(BINARY_NAME) 到 /usr/local/bin/..."
	@sudo cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/
	@echo "安装完成！"

# 运行测试
.PHONY: test
test:
	@echo "运行测试..."
	@go test ./...

# 格式化代码
.PHONY: fmt
fmt:
	@echo "格式化代码..."
	@go fmt ./...

# 显示版本信息
.PHONY: version
version:
	@$(BUILD_DIR)/$(BINARY_NAME) -version

# 显示帮助
.PHONY: help
help:
	@echo "可用的命令:"
	@echo "  make build      - 构建当前平台的可执行文件"
	@echo "  make build-all  - 构建所有支持平台的可执行文件"
	@echo "  make clean      - 清理构建目录"
	@echo "  make install    - 安装到系统路径"
	@echo "  make test       - 运行测试"
	@echo "  make fmt        - 格式化代码"
	@echo "  make version    - 显示版本信息"
	@echo "  make help       - 显示此帮助信息"