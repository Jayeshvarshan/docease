FROM node:20-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

COPY backend ./backend
RUN cd backend && npm install

EXPOSE 4000

CMD ["sh", "-c", "cd backend && node dev.js"]
