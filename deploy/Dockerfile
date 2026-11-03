# Backend + the pre-built web app (frontend/dist is built by deploy.sh before upload).
FROM node:22-alpine
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
# Express serves this in production (path: ../frontend/dist from the backend folder)
COPY frontend/dist /app/frontend/dist

ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "src/index.js"]
