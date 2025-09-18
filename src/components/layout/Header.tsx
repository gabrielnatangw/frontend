import { Button, useAuth, ProfileDropdown } from '../index';
import { LogIn, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={onMenuClick}
              className='md:hidden'
            >
              <Menu className='w-4 h-4' />
            </Button>
            <Link to='/' className='flex items-center'>
              <div className='text-2xl font-bold text-slate-900'>SMART</div>
              <div className='ml-2 text-xs text-slate-500'>S N P T TRACE</div>
            </Link>
          </div>
          <div className='flex items-center space-x-4'>
            {isAuthenticated ? (
              <>
                {/* Profile Dropdown com avatar */}
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link to='/auth/login'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-slate-300 text-slate-700 hover:bg-slate-50'
                  >
                    <LogIn className='w-4 h-4 mr-2' />
                    Login
                  </Button>
                </Link>
                <Button size='sm' className='bg-brand-600 hover:bg-brand-700'>
                  Começar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
