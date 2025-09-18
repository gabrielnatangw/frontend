#!/bin/bash

# Script de Rollback para Smart Trace
set -e

echo "🔄 Iniciando rollback..."

# Verificar se o ambiente foi especificado
if [ -z "$1" ]; then
    echo "❌ Erro: Especifique o ambiente (staging ou production)"
    echo "Uso: ./scripts/rollback.sh [staging|production] [revision-name]"
    exit 1
fi

ENVIRONMENT=$1
REVISION_NAME=$2

# Configurar variáveis baseadas no ambiente
if [ "$ENVIRONMENT" = "staging" ]; then
    PROJECT_ID=${GCP_PROJECT_ID_STAGING:-"smart-trace-staging-123456"}
    SERVICE_NAME="smart-trace-staging"
    REGION="us-central1"
elif [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_ID=${GCP_PROJECT_ID_PRODUCTION:-"smart-trace-production-123456"}
    SERVICE_NAME="smart-trace-production"
    REGION="us-central1"
else
    echo "❌ Erro: Ambiente inválido. Use 'staging' ou 'production'"
    exit 1
fi

echo "📋 Configuração:"
echo "  Ambiente: $ENVIRONMENT"
echo "  Projeto: $PROJECT_ID"
echo "  Serviço: $SERVICE_NAME"
echo "  Região: $REGION"

# Se não foi especificada uma revisão, listar as disponíveis
if [ -z "$REVISION_NAME" ]; then
    echo "📋 Revisões disponíveis:"
    gcloud run revisions list \
        --service=$SERVICE_NAME \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format="table(metadata.name,status.conditions[0].lastTransitionTime,status.trafficPercent)" \
        --limit=10
    
    echo ""
    echo "❌ Erro: Especifique o nome da revisão para fazer rollback"
    echo "Uso: ./scripts/rollback.sh $ENVIRONMENT REVISION_NAME"
    exit 1
fi

echo "🔍 Verificando se a revisão existe..."
if ! gcloud run revisions describe $REVISION_NAME \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --quiet >/dev/null 2>&1; then
    echo "❌ Erro: Revisão '$REVISION_NAME' não encontrada"
    exit 1
fi

echo "✅ Revisão encontrada: $REVISION_NAME"

# Fazer rollback
echo "🔄 Fazendo rollback para revisão: $REVISION_NAME"
gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$REVISION_NAME=100 \
    --region=$REGION \
    --project=$PROJECT_ID

echo "✅ Rollback concluído com sucesso!"

# Verificar status
echo "🔍 Verificando status do serviço..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(status.url)")

echo "🌐 URL do serviço: $SERVICE_URL"

# Health check
echo "🔍 Executando health check..."
sleep 10
if curl -f "$SERVICE_URL/health" >/dev/null 2>&1; then
    echo "✅ Health check passou!"
else
    echo "⚠️ Health check falhou. Verifique manualmente."
fi

echo "📋 Status atual do tráfego:"
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="table(status.traffic[].revisionName,status.traffic[].percent)"

echo "🎉 Rollback concluído!"
