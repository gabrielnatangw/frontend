import { useState } from 'react';
import { Button } from '../ui/button';
import { Menu, X, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeTopbarProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function HomeTopbar({
  sidebarOpen,
  onMenuClick,
}: HomeTopbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para mudar o estilo
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center'>
                <Star className='w-6 h-6 text-white' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent'>
                SMART TRACE
              </span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className='hidden md:flex items-center space-x-8'>
            <Link
              to='/p-trace'
              className='text-gray-300 hover:text-white transition-colors duration-300 font-medium'
            >
              P-TRACE
            </Link>
            <Link
              to='/d-trace'
              className='text-gray-300 hover:text-white transition-colors duration-300 font-medium'
            >
              D-TRACE
            </Link>
            <Link
              to='/e-trace'
              className='text-gray-300 hover:text-white transition-colors duration-300 font-medium'
            >
              E-TRACE
            </Link>
            <Link
              to='/m-trace'
              className='text-gray-300 hover:text-white transition-colors duration-300 font-medium'
            >
              M-TRACE
            </Link>
          </nav>

          {/* CTA Buttons Desktop */}
          <div className='hidden md:flex items-center space-x-4'>
            <Button
              variant='outline'
              className='border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300'
            >
              Contato
            </Button>
            <Button className='bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white transition-all duration-300 transform hover:scale-105'>
              <Play className='w-4 h-4 mr-2' />
              Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <Button
              variant='text'
              size='sm'
              onClick={onMenuClick}
              className='text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300'
            >
              {sidebarOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10'>
          <div className='px-4 py-6 space-y-4'>
            <nav className='space-y-4'>
              <Link
                to='/p-trace'
                className='block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2'
                onClick={onMenuClick}
              >
                P-TRACE
              </Link>
              <Link
                to='/d-trace'
                className='block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2'
                onClick={onMenuClick}
              >
                D-TRACE
              </Link>
              <Link
                to='/e-trace'
                className='block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2'
                onClick={onMenuClick}
              >
                E-TRACE
              </Link>
              <Link
                to='/m-trace'
                className='block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2'
                onClick={onMenuClick}
              >
                M-TRACE
              </Link>
            </nav>

            <div className='pt-4 border-t border-white/10 space-y-3'>
              <Button
                variant='outline'
                className='w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300'
              >
                Contato
              </Button>
              <Button className='w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white transition-all duration-300'>
                <Play className='w-4 h-4 mr-2' />
                Demo
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
