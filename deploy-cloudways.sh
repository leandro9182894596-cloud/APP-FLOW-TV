#!/bin/bash
# ============================================
# APP-FLOW-TV - Deploy Script for Cloudways
# ============================================
# Uso: bash deploy-cloudways.sh
# Execute DENTRO do diretorio da app no Cloudways
# Ex: /home/master/applications/SEU_APP/public_html
# ============================================

set -e

echo "========================================"
echo "  APP-FLOW-TV - Deploy Cloudways"
echo "========================================"
echo ""

# 1. Verificar Node.js
echo "[1/6] Verificando Node.js..."
node -v
npm -v

# 2. Instalar dependencias
echo "[2/6] Instalando dependencias..."
npm install

# 3. Gerar Prisma Client
echo "[3/6] Gerando Prisma Client..."
cd backend
npx prisma generate
cd ..

# 4. Build do frontend
echo "[4/6] Build do frontend..."
npm run build

# 5. Rodar migrations do banco
echo "[5/6] Rodando migrations do banco..."
cd backend
npx prisma migrate deploy
cd ..

# 6. Iniciar com PM2
echo "[6/6] Iniciando com PM2..."
pm2 start ecosystem.config.cjs --update-env
pm2 save

echo ""
echo "========================================"
echo "  Deploy concluido com sucesso!"
echo "========================================"
echo ""
echo "Comandos uteis:"
echo "  pm2 status           - Ver status dos processos"
echo "  pm2 logs flowtv      - Ver logs"
echo "  pm2 restart flowtv   - Reiniciar"
echo "  pm2 stop flowtv      - Parar"
echo ""
