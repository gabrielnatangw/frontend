import { type ReactNode } from 'react';
import { HeroCarousel } from '../ui/hero-carousel';
import pTraceImage from '../../assets/p-trace.jpg';
import dTraceImage from '../../assets/d-trace.jpg';
import eTraceImage from '../../assets/e-trace.jpg';
import mTraceImage from '../../assets/m-trace.jpg';
import dTraceLogo from '../../assets/logo-d-trace.png';
import pTraceLogo from '../../assets/logo-p-trace.png';
import eTraceLogo from '../../assets/logo-etrace.png';
import mTraceLogo from '../../assets/logo-mtrace.png';
import smartLogo from '../../assets/Logo-smart.svg';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
      {/* Coluna esquerda: conteúdo (form) das páginas de auth */}
      <section className='flex items-center justify-center p-8'>
        <div className='w-full max-w-sm space-y-6'>
          {/* Logo/Marca */}
          <div className='text-center select-none'>
            <img
              src={smartLogo}
              alt='SMART SNPT TRACE Logo'
              className='h-16 w-auto mx-auto'
            />
          </div>

          {/* Slot de conteúdo da página (ex.: formulário de login) */}
          <div className='space-y-4'>{children}</div>
        </div>
      </section>

      {/* Coluna direita: destaque/marketing */}
      <aside className='hidden md:flex items-center justify-center bg-brand-800/95 text-white p-8 relative overflow-hidden'>
        {/* Background dots */}
        <div className='pointer-events-none absolute inset-0 z-0'>
          {/* soft radial highlight */}
          <div className='absolute inset-0 bg-[radial-gradient(720px_420px_at_50%_10%,rgba(255,255,255,0.18),transparent_60%)]' />
          {/* dotted pattern */}
          <div className='absolute inset-0 opacity-90 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px] [background-position:0_0]' />
          {/* subtle vignette to soften edges */}
          <div className='absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_60%,rgba(0,0,0,0.12))]' />
        </div>
        <div className='relative z-10 max-w-md w-full text-center'>
          <HeroCarousel
            items={[
              {
                logo: (
                  <img
                    src={dTraceLogo}
                    alt='D-TRACE Logo'
                    className='h-12 w-auto'
                  />
                ),
                media: (
                  <img
                    src={dTraceImage}
                    alt='D-TRACE Interface'
                    className='aspect-video w-full rounded-md object-cover'
                  />
                ),
                text: (
                  <p className='text-sm leading-relaxed text-white/90'>
                    O D-TRACE conecta o planejamento empresarial (ERP) ao chão
                    de fábrica, monitorando dados de produção em tempo real.
                    Facilita a colaboração entre equipes e reduz falhas
                    operacionais.
                  </p>
                ),
              },
              {
                logo: (
                  <img
                    src={pTraceLogo}
                    alt='P-TRACE Logo'
                    className='h-12 w-auto'
                  />
                ),
                media: (
                  <img
                    src={pTraceImage}
                    alt='P-TRACE Interface'
                    className='aspect-video w-full rounded-md object-cover'
                  />
                ),
                text: (
                  <p className='text-sm leading-relaxed text-white/90'>
                    O P-TRACE conecta o planejamento empresarial (ERP) ao chão
                    de fábrica, monitorando dados de produção em tempo real.
                    Facilita a colaboração entre equipes e reduz falhas
                    operacionais.
                  </p>
                ),
              },
              {
                logo: (
                  <img
                    src={eTraceLogo}
                    alt='E-TRACE Logo'
                    className='h-12 w-auto'
                  />
                ),
                media: (
                  <img
                    src={eTraceImage}
                    alt='E-TRACE Interface'
                    className='aspect-video w-full rounded-md object-cover'
                  />
                ),
                text: (
                  <p className='text-sm leading-relaxed text-white/90'>
                    O E-TRACE oferece soluções avançadas de rastreabilidade e
                    monitoramento de equipamentos industriais. Integra sistemas
                    de controle e fornece insights em tempo real para otimização
                    de processos.
                  </p>
                ),
              },
              {
                logo: (
                  <img
                    src={mTraceLogo}
                    alt='M-TRACE Logo'
                    className='h-12 w-auto'
                  />
                ),
                media: (
                  <img
                    src={mTraceImage}
                    alt='M-TRACE Interface'
                    className='aspect-video w-full rounded-md object-cover'
                  />
                ),
                text: (
                  <p className='text-sm leading-relaxed text-white/90'>
                    O M-TRACE é especializado em monitoramento de máquinas e
                    equipamentos industriais. Fornece análises preditivas e
                    manutenção preventiva para maximizar a eficiência
                    operacional.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </aside>
    </main>
  );
}
