# 多阶段构建，用于构建TLS-Client CLI
FROM golang:1.21-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apk add --no-cache git ca-certificates tzdata

# 复制Go模块文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建可执行文件
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o tls-client \
    ./cmd/cli

# 运行阶段
FROM alpine:latest

# 安装CA证书
RUN apk --no-cache add ca-certificates

# 创建非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 设置工作目录
WORKDIR /app

# 从构建阶段复制可执行文件
COPY --from=builder /app/tls-client .

# 修改文件权限
RUN chmod +x tls-client

# 切换到非root用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./tls-client -version || exit 1

# 设置入口点
ENTRYPOINT ["./tls-client"]

# 默认显示帮助信息
CMD ["-help"]
