FROM node:8

# 项目在容器中的路径
WORKDIR /app

# 当前路径copy到容器中的/app
COPY . .

# 安装依赖并构建
RUN make install && make build

# 暴露端口3000,这样容器外部可以访问
EXPOSE 3000

# 启动项目
CMD [ "node", "app.js" ]