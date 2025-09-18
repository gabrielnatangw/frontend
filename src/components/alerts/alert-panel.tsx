import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, X, Bell, BellOff } from 'lucide-react';

interface AlertInfo {
  id: string;
  sensorId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

interface AlertPanelProps {
  alerts: AlertInfo[];
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
  maxAlerts?: number;
  showOnlyCritical?: boolean;
}

export default function AlertPanel({
  alerts,
  onDismiss,
  onDismissAll,
  maxAlerts = 5,
  showOnlyCritical = false,
}: AlertPanelProps) {
  const filteredAlerts = showOnlyCritical
    ? alerts.filter(alert => alert.severity === 'critical')
    : alerts;

  const displayAlerts = filteredAlerts.slice(0, maxAlerts);

  if (displayAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className='w-4 h-4 text-red-600' />;
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-yellow-600' />;
      case 'info':
        return <Bell className='w-4 h-4 text-blue-600' />;
      default:
        return <BellOff className='w-4 h-4 text-gray-600' />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant='destructive'>Crítico</Badge>;
      case 'warning':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            Atenção
          </Badge>
        );
      case 'info':
        return (
          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
            Info
          </Badge>
        );
      default:
        return <Badge variant='outline'>Normal</Badge>;
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            <h3 className='font-semibold text-lg'>Alertas Ativos</h3>
            <Badge variant='outline'>{displayAlerts.length}</Badge>
          </div>
          {onDismissAll && (
            <Button
              variant='text'
              size='sm'
              onClick={onDismissAll}
              className='text-gray-500 hover:text-gray-700'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>

        <div className='space-y-3'>
          {displayAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-2 flex-1'>
                  {getSeverityIcon(alert.severity)}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-medium text-sm'>
                        {alert.sensorId}
                      </span>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className='text-sm opacity-90'>{alert.message}</p>
                    <p className='text-xs opacity-75 mt-1'>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {onDismiss && (
                  <Button
                    variant='text'
                    size='sm'
                    onClick={() => onDismiss(alert.id)}
                    className='text-gray-500 hover:text-gray-700 ml-2'
                  >
                    <X className='w-3 h-3' />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length > maxAlerts && (
          <div className='mt-3 text-center'>
            <p className='text-sm text-gray-500'>
              +{filteredAlerts.length - maxAlerts} alertas adicionais
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
