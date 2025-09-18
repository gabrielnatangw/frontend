import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface HelpCenterFooterProps {
  isOpen?: boolean;
  className?: string;
}

export function HelpCenterFooter({
  isOpen = true,
  className = '',
}: HelpCenterFooterProps) {
  const navigate = useNavigate();

  const handleHelpCenterClick = () => {
    navigate('/help-center');
  };

  if (!isOpen) {
    return (
      <div className={`flex justify-center p-2 ${className}`}>
        <Button
          variant='text'
          size='sm'
          onClick={handleHelpCenterClick}
          className='text-white/70 hover:text-white hover:bg-white/10 p-2'
        >
          <HelpCircle size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-3 ${className}`}>
      <Button
        variant='text'
        size='sm'
        onClick={handleHelpCenterClick}
        className='w-full justify-start text-white/80 hover:text-white hover:bg-white/10 text-sm'
      >
        <HelpCircle size={16} className='mr-2' />
        Centro de Ajuda
      </Button>
    </div>
  );
}
