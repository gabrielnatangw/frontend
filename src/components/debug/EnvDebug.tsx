import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Copy, Check, Bug, BugOff } from 'lucide-react';
import { debug } from '../../lib/utils/debug';

export function EnvDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(debug.isDebugEnabled());

  const envVars = {
    VITE_API_URL: 'https://smart-production-2549.up.railway.app/api',
    VITE_WS_URL: 'http://trolley.proxy.rlwy.net:15811',
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
    VITE_MODE: import.meta.env.MODE,
    VITE_DEV: import.meta.env.DEV,
    VITE_PROD: import.meta.env.PROD,
    VITE_DEBUG: import.meta.env.VITE_DEBUG,
  };

  const toggleDebug = () => {
    const newState = !debugEnabled;
    setDebugEnabled(newState);
    debug.setEnabled(newState);
    debug.info('Debug system toggled', { enabled: newState });
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const copyAllEnv = async () => {
    const envString = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    await copyToClipboard(envString, 'all');
  };

  if (!isVisible) {
    return (
      <div className='fixed bottom-4 right-4 z-50 flex gap-2'>
        <Button
          onClick={toggleDebug}
          size='sm'
          variant='outline'
          className={
            debugEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }
        >
          {debugEnabled ? (
            <Bug size={16} className='mr-2' />
          ) : (
            <BugOff size={16} className='mr-2' />
          )}
          Debug {debugEnabled ? 'ON' : 'OFF'}
        </Button>
        <Button
          onClick={() => setIsVisible(true)}
          size='sm'
          variant='outline'
          className='bg-blue-500 text-white hover:bg-blue-600'
        >
          <Eye size={16} className='mr-2' />
          ENV
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto'>
      <Card className='p-4 bg-white shadow-lg border-2 border-blue-200'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Debug - Variáveis de Ambiente
          </h3>
          <div className='flex gap-2'>
            <Button
              onClick={toggleDebug}
              size='sm'
              variant={debugEnabled ? 'contained' : 'outline'}
              className={`text-xs ${
                debugEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {debugEnabled ? (
                <Bug size={14} className='mr-1' />
              ) : (
                <BugOff size={14} className='mr-1' />
              )}
              {debugEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              onClick={copyAllEnv}
              size='sm'
              variant='outline'
              className='text-xs'
            >
              {copied === 'all' ? <Check size={14} /> : <Copy size={14} />}
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              size='sm'
              variant='outline'
              className='text-xs'
            >
              <EyeOff size={14} />
            </Button>
          </div>
        </div>

        <div className='space-y-3'>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className='space-y-1'>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-xs font-mono'>
                  {key}
                </Badge>
                <Button
                  onClick={() => copyToClipboard(value || '', key)}
                  size='sm'
                  variant='text'
                  className='h-6 w-6 p-0'
                >
                  {copied === key ? <Check size={12} /> : <Copy size={12} />}
                </Button>
              </div>
              <div className='text-sm font-mono bg-gray-100 p-2 rounded break-all'>
                {value || (
                  <span className='text-gray-400 italic'>não definida</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 pt-3 border-t border-gray-200'>
          <div className='text-xs text-gray-500'>
            <strong>Modo:</strong> {import.meta.env.MODE} |
            <strong> Dev:</strong> {import.meta.env.DEV ? 'Sim' : 'Não'} |
            <strong> Prod:</strong> {import.meta.env.PROD ? 'Sim' : 'Não'}
          </div>
        </div>
      </Card>
    </div>
  );
}
