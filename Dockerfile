FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

COPY backend ./backend
RUN cd backend && npm install

COPY backend/dev.js ./backend/dev.js

EXPOSE 4000

CMD ["sh", "-c", "cd backend && node dev.js"]
