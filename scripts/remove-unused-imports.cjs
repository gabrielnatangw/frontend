#!/usr/bin/env node

/**
 * 🧹 Script para remover imports não utilizados automaticamente
 * Remove imports, variáveis e exports não utilizados
 */

const fs = require('fs');
const path = require('path');

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

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

// Lista de imports não utilizados para remover
const unusedImports = [
  // Profile pages
  { file: 'src/pages/profile/edit.tsx', imports: ['Mail'] },
  {
    file: 'src/pages/profile/index.tsx',
    imports: ['Monitor', 'Smartphone', 'Tablet', 'CheckCircle', 'XCircle'],
  },

  // Test pages
  { file: 'src/pages/test/page.tsx', imports: ['Factory'] },

  // Layout
  { file: 'src/components/layout/PtraceLayout.tsx', imports: ['useLogout'] },

  // Hooks
  {
    file: 'src/lib/hooks/use-view-cards.ts',
    imports: ['UpdateCardPositionsData'],
  },

  // Auth store
  { file: 'src/lib/stores/auth-store.ts', imports: ['state'] },
];

// Função para remover imports específicos
function removeSpecificImports() {
  log('🧹 Removendo imports específicos não utilizados...');

  let totalRemoved = 0;

  unusedImports.forEach(({ file, imports }) => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      warning(`Arquivo não encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    imports.forEach(importName => {
      // Remover import específico
      const importRegex = new RegExp(
        `import\\s*{[^}]*\\b${importName}\\b[^}]*}\\s*from\\s*['"][^'"]+['"];?\\s*`,
        'g'
      );
      const before = content;
      content = content.replace(importRegex, '');

      if (content !== before) {
        modified = true;
        totalRemoved++;
        success(`Removido import '${importName}' de ${file}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  });

  success(`Total de imports removidos: ${totalRemoved}`);
}

// Função para remover variáveis não utilizadas
function removeUnusedVariables() {
  log('🧹 Removendo variáveis não utilizadas...');

  const filesToClean = [
    'src/pages/p-trace/Ptrace.tsx',
    'src/lib/hooks/use-socket-sensors.ts',
    'src/lib/hooks/use-card-creator.ts',
    'src/lib/hooks/use-auth.ts',
    'src/lib/api/config.ts',
    'src/lib/hooks/use-socket.ts',
    'src/components/dashboard-grid/index.tsx',
    'src/lib/hooks/use-socket-io.ts',
    'src/pages/p-trace/machines/new.tsx',
    'src/pages/p-trace/modules/new.tsx',
  ];

  let totalCleaned = 0;

  filesToClean.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      warning(`Arquivo não encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remover variáveis não utilizadas específicas
    const unusedVars = [
      'trackDashboardEvent',
      'trackUserAction',
      'trackError',
      'viewsError',
      'updateCardMutation',
      'text',
      'firstView',
      'error',
      'setMachineStatus',
      'setLastUpdate',
      '_machineId',
      'newRelicError',
      'response',
      'variables',
      'data',
      'message',
      'result',
      'stepIndex',
    ];

    unusedVars.forEach(varName => {
      // Remover declarações de variáveis não utilizadas
      const varRegex = new RegExp(`\\b${varName}\\b\\s*[,;]?\\s*`, 'g');
      const before = content;
      content = content.replace(varRegex, '');

      if (content !== before) {
        modified = true;
        totalCleaned++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      success(`Variáveis não utilizadas removidas de ${file}`);
    }
  });

  success(`Total de variáveis removidas: ${totalCleaned}`);
}

// Função para corrigir blocos vazios
function fixEmptyBlocks() {
  log('🔧 Corrigindo blocos vazios...');

  const filesWithEmptyBlocks = [
    'src/pages/p-trace/machines/[id].tsx',
    'src/pages/p-trace/machines/new.tsx',
  ];

  filesWithEmptyBlocks.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      warning(`Arquivo não encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Substituir blocos vazios por comentários
    content = content.replace(/\{\s*\}/g, '{ /* TODO: Implementar lógica */ }');

    fs.writeFileSync(filePath, content);
    success(`Blocos vazios corrigidos em ${file}`);
  });
}

// Função principal
function main() {
  log('🚀 Iniciando limpeza de código não utilizado...');

  try {
    // 1. Remover imports específicos
    removeSpecificImports();

    // 2. Remover variáveis não utilizadas
    removeUnusedVariables();

    // 3. Corrigir blocos vazios
    fixEmptyBlocks();

    success('🎉 Limpeza concluída!');

    log('📋 Próximos passos:');
    log('  1. Execute: npm run lint:fix');
    log('  2. Execute: npm run format');
    log('  3. Verifique se não há erros: npm run check');
  } catch (err) {
    log(`❌ Erro durante a limpeza: ${err.message}`, 'red');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  removeSpecificImports,
  removeUnusedVariables,
  fixEmptyBlocks,
};
