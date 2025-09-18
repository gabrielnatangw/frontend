#!/usr/bin/env node

/**
 * 🧹 Script simples para remover imports não utilizados
 * Remove apenas imports específicos identificados
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

// Lista específica de imports para remover
const importsToRemove = [
  {
    file: 'src/pages/profile/edit.tsx',
    imports: ['Mail'],
    from: 'lucide-react',
  },
  {
    file: 'src/pages/profile/index.tsx',
    imports: ['Monitor', 'Smartphone', 'Tablet', 'CheckCircle', 'XCircle'],
    from: 'lucide-react',
  },
  {
    file: 'src/pages/test/page.tsx',
    imports: ['Factory'],
    from: 'lucide-react',
  },
  {
    file: 'src/components/layout/PtraceLayout.tsx',
    imports: ['useLogout'],
    from: '../../lib/hooks/use-auth',
  },
  {
    file: 'src/lib/hooks/use-view-cards.ts',
    imports: ['UpdateCardPositionsData'],
    from: '../../types/view',
  },
];

// Função para remover imports específicos
function removeImports() {
  log('🧹 Removendo imports não utilizados...');

  let totalRemoved = 0;

  importsToRemove.forEach(({ file, imports, from }) => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      warning(`Arquivo não encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    imports.forEach(importName => {
      // Padrão para remover import específico
      const patterns = [
        // Import individual: import { Mail } from 'lucide-react';
        new RegExp(
          `import\\s*{\\s*${importName}\\s*}\\s*from\\s*['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?\\s*`,
          'g'
        ),
        // Import em lista: import { Mail, User } from 'lucide-react';
        new RegExp(`\\b${importName}\\s*,?\\s*`, 'g'),
        // Import no final da lista: import { User, Mail } from 'lucide-react';
        new RegExp(`,\\s*${importName}\\s*`, 'g'),
      ];

      patterns.forEach(pattern => {
        const before = content;
        content = content.replace(pattern, '');
        if (content !== before) {
          modified = true;
          totalRemoved++;
        }
      });
    });

    if (modified) {
      // Limpar linhas vazias e vírgulas extras
      content = content
        .replace(/,\s*}/g, '}')
        .replace(/{\s*,/g, '{')
        .replace(/{\s*}/g, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n');

      fs.writeFileSync(filePath, content);
      success(`Imports removidos de ${file}`);
    }
  });

  success(`Total de imports removidos: ${totalRemoved}`);
}

// Função principal
function main() {
  log('🚀 Iniciando limpeza de imports...');

  try {
    removeImports();
    success('🎉 Limpeza concluída!');

    log('📋 Próximos passos:');
    log('  1. Execute: npm run lint:fix');
    log('  2. Execute: npm run format');
    log('  3. Verifique: npm run check');
  } catch (err) {
    log(`❌ Erro: ${err.message}`, 'red');
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { removeImports };
