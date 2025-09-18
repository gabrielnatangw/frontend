import { useState, useEffect } from 'react';
import { usePermissionsComplete } from './use-permissions-complete';
import { useAuth } from './use-auth';

type AppStep = 'login' | 'select-app' | 'ready';

export function useAppInitialization() {
  const { user } = useAuth();
  const {
    applications,
    currentApplication,
    loadApplications,
    setCurrentApplication,
    loading,
  } = usePermissionsComplete();

  const [step, setStep] = useState<AppStep>('login');

  // Carregar aplicações após login
  useEffect(() => {
    if (user && applications.length === 0 && !loading) {
      loadApplications();
    }
  }, [user, applications.length, loading, loadApplications]);

  // Avançar para seleção de aplicação quando aplicações carregarem
  useEffect(() => {
    if (user && applications.length > 0 && step === 'login') {
      setStep('select-app');
    }
  }, [user, applications.length, step]);

  // Avançar para ready quando aplicação for selecionada
  useEffect(() => {
    if (currentApplication && step === 'select-app') {
      setStep('ready');
    }
  }, [currentApplication, step]);

  // Reset quando usuário fizer logout
  useEffect(() => {
    if (!user) {
      setStep('login');
    }
  }, [user]);

  const handleApplicationSelected = (application: any) => {
    setCurrentApplication(application);
  };

  return {
    step,
    user,
    applications,
    currentApplication,
    loading,
    handleApplicationSelected,
    setCurrentApplication,
  };
}
