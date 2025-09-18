#!/usr/bin/env node

/**
 * 🧹 Script para limpar código não utilizado
 * Remove imports, exports e variáveis não utilizadas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'blue') {
  console.log(
    `${colors[color]}[${new Date().toLocaleTimeString()}]${colors.reset} ${message}`
  );
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

// Função para executar comandos
function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output;
  } catch (err) {
    error(`Falha ao executar: ${command}`);
    console.error(err.message);
    return null;
  }
}

// Função para remover imports não utilizados
function removeUnusedImports() {
  log('🧹 Removendo imports não utilizados...');

  // Usar ESLint para remover imports não utilizados
  const result = runCommand(
    'npx eslint . --fix --ext .ts,.tsx',
    'Executando ESLint auto-fix'
  );

  if (result) {
    success('Imports não utilizados removidos');
  } else {
    warning('Alguns imports não puderam ser removidos automaticamente');
  }
}

// Função para remover exports não utilizados
function removeUnusedExports() {
  log('🧹 Verificando exports não utilizados...');

  // Verificar exports não utilizados
  const result = runCommand(
    'npx ts-unused-exports tsconfig.json',
    'Verificando exports não utilizados'
  );

  if (result) {
    warning('Exports não utilizados encontrados. Verifique manualmente.');
    console.log(result);
  } else {
    success('Nenhum export não utilizado encontrado');
  }
}

// Função para remover arquivos não utilizados
function removeUnusedFiles() {
  log('🧹 Verificando arquivos não utilizados...');

  // Verificar arquivos não utilizados
  const result = runCommand(
    'npx unimported',
    'Verificando arquivos não utilizados'
  );

  if (result) {
    warning('Arquivos não utilizados encontrados. Verifique manualmente.');
    console.log(result);
  } else {
    success('Nenhum arquivo não utilizado encontrado');
  }
}

// Função para limpar variáveis não utilizadas
function cleanUnusedVariables() {
  log('🧹 Limpando variáveis não utilizadas...');

  // Usar ESLint para remover variáveis não utilizadas
  const result = runCommand(
    'npx eslint . --fix --ext .ts,.tsx',
    'Executando ESLint auto-fix'
  );

  if (result) {
    success('Variáveis não utilizadas removidas');
  } else {
    warning('Algumas variáveis não puderam ser removidas automaticamente');
  }
}

// Função para formatar código
function formatCode() {
  log('🎨 Formatando código...');

  // Usar Prettier para formatar
  const result = runCommand(
    'npx prettier --write .',
    'Formatando código com Prettier'
  );

  if (result) {
    success('Código formatado');
  } else {
    warning('Alguns arquivos não puderam ser formatados');
  }
}

// Função para verificar se há erros
function checkForErrors() {
  log('🔍 Verificando erros...');

  // Verificar erros de TypeScript
  const tsResult = runCommand(
    'npx tsc --noEmit',
    'Verificando erros TypeScript'
  );

  if (tsResult) {
    success('Nenhum erro TypeScript encontrado');
  } else {
    error('Erros TypeScript encontrados');
  }

  // Verificar erros de ESLint
  const eslintResult = runCommand(
    'npx eslint . --ext .ts,.tsx',
    'Verificando erros ESLint'
  );

  if (eslintResult) {
    success('Nenhum erro ESLint encontrado');
  } else {
    warning('Alguns warnings ESLint encontrados');
  }
}

// Função principal
function main() {
  log('🚀 Iniciando limpeza de código não utilizado...');

  try {
    // 1. Remover imports não utilizados
    removeUnusedImports();

    // 2. Limpar variáveis não utilizadas
    cleanUnusedVariables();

    // 3. Verificar exports não utilizados
    removeUnusedExports();

    // 4. Verificar arquivos não utilizados
    removeUnusedFiles();

    // 5. Formatar código
    formatCode();

    // 6. Verificar erros
    checkForErrors();

    success('🎉 Limpeza concluída!');

    log('📋 Resumo:');
    log('  - Imports não utilizados removidos');
    log('  - Variáveis não utilizadas removidas');
    log('  - Código formatado');
    log('  - Exports e arquivos não utilizados verificados');
  } catch (err) {
    error(`Erro durante a limpeza: ${err.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  removeUnusedImports,
  removeUnusedExports,
  removeUnusedFiles,
  cleanUnusedVariables,
  formatCode,
  checkForErrors,
};
