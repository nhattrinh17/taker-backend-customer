# Sử dụng hình ảnh Node.js phiên bản 18 dựa trên Alpine Linux
FROM node:18-alpine AS development

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json để cài đặt các phụ thuộc
COPY package.json ./

# Cài đặt git, tzdata và các công cụ build như python, make, g++
RUN apk add --no-cache git tzdata python3 make g++ && \
    yarn install --frozen-lockfile && \
    yarn cache clean

# Thiết lập múi giờ
ENV TZ="Asia/Ho_Chi_Minh"

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Chạy lệnh build (cần phải có script build trong package.json)
RUN yarn run build

# Expose cổng 9999 ra bên ngoài
EXPOSE 9999

# Sử dụng CMD để chạy ứng dụng NestJS
CMD ["node", "dist/main"]
