#!/bin/bash

# Script para debug das variáveis de ambiente na VM
echo "🔍 Debug das Variáveis de Ambiente"
echo "=================================="
echo ""

echo "📋 Variáveis de Ambiente do Sistema:"
echo "------------------------------------"
echo "NODE_ENV: $NODE_ENV"
echo "VITE_API_URL: $VITE_API_URL"
echo ""

echo "📦 Informações do Container:"
echo "----------------------------"
echo "Container ID: $(hostname)"
echo "Data/Hora: $(date)"
echo "Uptime: $(uptime)"
echo ""

echo "🌐 Variáveis de Ambiente do Vite:"
echo "---------------------------------"
if [ -f ".env" ]; then
    echo "Arquivo .env encontrado:"
    cat .env
else
    echo "Arquivo .env não encontrado"
fi

echo ""
echo "🔧 Configurações do Build:"
echo "--------------------------"
echo "Modo: ${VITE_MODE:-production}"
echo "Dev: ${VITE_DEV:-false}"
echo "Prod: ${VITE_PROD:-true}"

echo ""
echo "📊 Status da Aplicação:"
echo "----------------------"
if pgrep -f "node.*vite" > /dev/null; then
    echo "✅ Vite dev server está rodando"
else
    echo "❌ Vite dev server não está rodando"
fi

if pgrep -f "nginx" > /dev/null; then
    echo "✅ Nginx está rodando"
else
    echo "❌ Nginx não está rodando"
fi

echo ""
echo "🌍 Teste de Conectividade:"
echo "-------------------------"
if [ -n "$VITE_API_URL" ]; then
    echo "Testando API URL: $VITE_API_URL"
    curl -s -o /dev/null -w "Status: %{http_code}, Tempo: %{time_total}s\n" "$VITE_API_URL" || echo "❌ Falha na conexão com API"
else
    echo "❌ VITE_API_URL não definida"
fi

echo "WebSocket URL: http://127.0.0.1:3001/sensor (fixa para testes locais)"

echo ""
echo "📝 Logs da Aplicação (últimas 10 linhas):"
echo "----------------------------------------"
if [ -f "logs/app.log" ]; then
    tail -10 logs/app.log
else
    echo "Arquivo de log não encontrado"
fi

echo ""
echo "✅ Debug concluído!"
