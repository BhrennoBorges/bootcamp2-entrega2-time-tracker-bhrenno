# Base Playwright com Chromium e dependências do sistema
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app

# Dependências do projeto
COPY package*.json ./
RUN npm ci --silent

# Código do projeto
COPY . .

# Garante navegadores (robusteza futura)
RUN npx playwright install --with-deps chromium

# Build da extensão (gera dist/ e dist/extension.zip)
RUN npm run build

# Comando padrão: roda E2E
CMD ["npm","run","test:e2e"]
