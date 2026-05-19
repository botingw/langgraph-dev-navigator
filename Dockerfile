# Node 20 LTS on Debian slim. glibc-based so `bcrypt` prebuilt binaries install
# without native build tooling (alpine would require `apk add python3 make g++`).
FROM node:20-slim

WORKDIR /app

# Copy package files first to leverage Docker layer caching:
# `npm ci` only re-runs when package*.json changes, not when source changes.
COPY api/package.json api/package-lock.json ./api/
RUN cd api && npm ci --omit=dev

# Copy app sources after deps so source edits don't bust the npm layer.
COPY api/ ./api/
COPY web/replit/ ./web/replit/

# Cloud Run convention. Runtime sets PORT=8080; this default matches so the
# image is self-consistent when PORT is unset (e.g. local `docker run`).
ENV PORT=8080
EXPOSE 8080

# Run from api/ so `../web/replit` (server.js:54, :467) resolves correctly.
WORKDIR /app/api
CMD ["node", "server.js"]
