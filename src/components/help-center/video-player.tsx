import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTrackViewProgress } from '../../lib/hooks/use-help-center';
import { useAuthStore } from '../../lib/stores/auth-store';
import type { Video } from '../../types/help-center';

interface VideoPlayerProps {
  video: Video;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function VideoPlayer({
  video,
  onProgress,
  onComplete,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const trackProgressMutation = useTrackViewProgress();

  // Configurar vídeo baseado na plataforma
  const getVideoSource = () => {
    switch (video.video_platform) {
      case 'YOUTUBE':
        return `https://www.youtube.com/embed/${video.external_video_id}?autoplay=0&controls=1&modestbranding=1&rel=0`;
      case 'VIMEO':
        return `https://player.vimeo.com/video/${video.external_video_id}?autoplay=0&controls=1`;
      case 'DAILYMOTION':
        return `https://www.dailymotion.com/embed/video/${video.external_video_id}?autoplay=0&controls=1`;
      case 'CUSTOM':
        return video.external_url;
      default:
        return video.external_url;
    }
  };

  const isEmbedded = ['YOUTUBE', 'VIMEO', 'DAILYMOTION'].includes(
    video.video_platform
  );

  // Rastrear progresso de visualização
  const trackProgress = useCallback(
    (watchDuration: number, completed: boolean = false) => {
      if (user?.id) {
        trackProgressMutation.mutate({
          userId: user.id,
          videoId: video.id,
          watchDuration,
          completed,
        });
      }
    },
    [user?.id, trackProgressMutation, video.id]
  );

  // Atualizar tempo atual
  const updateCurrentTime = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Rastrear progresso a cada 10 segundos
      if (Math.floor(time) % 10 === 0) {
        trackProgress(Math.floor(time));
      }

      onProgress?.(time);
    }
  }, [trackProgress, onProgress]);

  // Verificar se vídeo foi completado
  const checkCompletion = useCallback(() => {
    if (videoRef.current && currentTime >= duration - 1) {
      trackProgress(Math.floor(duration), true);
      onComplete?.();
    }
  }, [currentTime, duration, trackProgress, onComplete]);

  // Controles de reprodução
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Formatar tempo
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      updateCurrentTime();
      checkCompletion();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      trackProgress(Math.floor(duration), true);
      onComplete?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [duration, onComplete, checkCompletion, trackProgress, updateCurrentTime]);

  // Mostrar/ocultar controles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  if (isEmbedded) {
    return (
      <div className={`relative ${className}`}>
        <div className='aspect-video bg-gray-100 rounded-lg overflow-hidden'>
          <iframe
            src={getVideoSource()}
            className='w-full h-full'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>

        {/* Overlay com informações */}
        <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
          <div className='bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm'>
            {video.title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        className='w-full h-full rounded-lg'
        poster={video.thumbnail_url}
        preload='metadata'
      >
        <source src={video.external_url} type='video/mp4' />
        Seu navegador não suporta vídeos HTML5.
      </video>

      {/* Overlay de controles */}
      {showControls && (
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end'>
          {/* Controles superiores */}
          <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
            <div className='bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm max-w-md'>
              {video.title}
            </div>
            <div className='flex space-x-2'>
              <Button
                variant='text'
                size='sm'
                onClick={restart}
                className='bg-black bg-opacity-70 text-white hover:bg-opacity-80'
              >
                <RotateCcw size={16} />
              </Button>
              <Button
                variant='text'
                size='sm'
                onClick={toggleFullscreen}
                className='bg-black bg-opacity-70 text-white hover:bg-opacity-80'
              >
                <Maximize size={16} />
              </Button>
            </div>
          </div>

          {/* Controles inferiores */}
          <div className='p-4 space-y-3'>
            {/* Barra de progresso */}
            <div className='space-y-1'>
              <input
                type='range'
                min='0'
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className='w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider'
              />
              <div className='flex justify-between text-xs text-white'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles principais */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Button
                  variant='text'
                  size='sm'
                  onClick={togglePlay}
                  className='text-white hover:bg-white/20'
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>

                <div className='flex items-center space-x-2'>
                  <Button
                    variant='text'
                    size='sm'
                    onClick={toggleMute}
                    className='text-white hover:bg-white/20'
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </Button>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.1'
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className='w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider'
                  />
                </div>
              </div>

              <div className='text-sm text-white'>
                {video.duration &&
                  `${formatTime(currentTime)} / ${formatTime(video.duration)}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de play central */}
      {!isPlaying && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Button
            size='lg'
            onClick={togglePlay}
            className='w-16 h-16 rounded-full bg-white/90 hover:bg-white text-gray-800'
          >
            <Play size={24} className='ml-1' />
          </Button>
        </div>
      )}
    </div>
  );
}
