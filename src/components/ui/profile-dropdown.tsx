import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, Settings, Lock, LogOut } from 'lucide-react';
import { useAuth, useLogout } from '../../lib/hooks/use-auth';
import { Avatar, AvatarFallback } from './avatar';

// Função para extrair as iniciais do nome
const getInitials = (name: string): string => {
  if (!name) return '??';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Se só tem uma palavra, pega as duas primeiras letras
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Se tem múltiplas palavras, pega a primeira letra de cada palavra (máximo 2)
    return words
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }
};

interface ProfileDropdownProps {
  className?: string;
}

export default function ProfileDropdown({ className }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar dropdown ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do avatar */}
      <button
        onClick={toggleDropdown}
        className='flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        <Avatar className='h-8 w-8 border-2 border-slate-200'>
          <AvatarFallback className='text-xs font-semibold text-slate-600'>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className='hidden sm:block text-left'>
          <p className='text-sm font-medium text-slate-900'>{user.name}</p>
          <p className='text-xs text-slate-500'>{user.email}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50'>
          {/* Header do usuário */}
          <div className='px-4 py-3 border-b border-slate-100'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border-2 border-slate-200'>
                <AvatarFallback className='text-sm font-semibold text-slate-600'>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-slate-900 truncate'>
                  {user.name}
                </p>
                <p className='text-xs text-slate-500 truncate'>{user.email}</p>
                <div className='flex items-center gap-2 mt-1'>
                  {user.accessType && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.accessType === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.accessType}
                    </span>
                  )}
                  {user.firstLogin && (
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                      Primeiro Login
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu de navegação */}
          <div className='py-1'>
            <Link
              to='/p-trace/profile'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors'
            >
              <User size={16} className='text-slate-400' />
              Meu Perfil
            </Link>

            <Link
              to='/p-trace/profile/edit'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors'
            >
              <Settings size={16} className='text-slate-400' />
              Editar Perfil
            </Link>

            <Link
              to='/p-trace/profile/password'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors'
            >
              <Lock size={16} className='text-slate-400' />
              Alterar Senha
            </Link>
          </div>

          {/* Separador */}
          <div className='border-t border-slate-100 my-1' />

          {/* Ações do sistema */}
          <div className='py-1'>
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className='flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <LogOut size={16} className='text-red-400' />
              {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
