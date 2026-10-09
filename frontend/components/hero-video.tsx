"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface HeroVideoProps {
  videoUrl: string;
  posterUrl?: string;
  titleKey?: string;
  subtitleKey?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function HeroVideo({
  videoUrl,
  posterUrl,
  titleKey,
  subtitleKey,
  title,
  subtitle,
  className,
  autoPlay = false,
  loop = true,
  muted: initialMuted = true,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [parallaxY, setParallaxY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom > 0 && rect.top < windowH) {
        const progress = (windowH - rect.top) / (windowH + rect.height);
        setParallaxY((progress - 0.5) * 1000); // -150px to +150px
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reload video when URL changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked by browser
          setIsPlaying(false);
        });
      }
    }
  }, [videoUrl, autoPlay]);

  const togglePlay = () => {
    if (isYouTube && iframeRef.current) {
      const message = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, '*');
      setIsPlaying(!isPlaying);
      return;
    }

    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error("Video play failed:", err);
        alert("Không thể phát video. Vui lòng kiểm tra lại định dạng file hoặc link video.");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (isYouTube && iframeRef.current) {
      const message = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, '*');
      setIsMuted(!isMuted);
      return;
    }

    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!mounted) {
    return <div className={cn("relative w-screen h-screen bg-slate-900", className)} />;
  }

  return (
    <div ref={containerRef} className={cn("relative w-screen h-screen overflow-hidden group", className)} suppressHydrationWarning>
      {/* Parallax Video or YouTube Iframe */}
      <div
        className="absolute inset-[-160px]"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        {isYouTube ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            style={{ width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay={autoPlay}
            loop={loop}
            muted={isMuted}
            playsInline
            poster={posterUrl}
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        
        {/* Custom Poster Image */}
        {posterUrl && !isPlaying && (
          <div className="absolute inset-0">
            <Image
              src={posterUrl}
              alt="Video poster"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500", isPlaying ? "opacity-0" : "opacity-100")} />

      {/* Content */}
      {(title || titleKey || subtitle || subtitleKey) && (
        <div className={cn("absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white p-6 transition-opacity duration-500", isPlaying ? "opacity-0" : "opacity-100")}>
          {(title || titleKey) && (
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
              {title || (titleKey ? t(titleKey) : "")}
            </h2>
          )}
          {(subtitle || subtitleKey) && (
            <p className="text-lg md:text-2xl max-w-3xl text-white/90 drop-shadow-md">
              {subtitle || (subtitleKey ? t(subtitleKey) : "")}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 transition-opacity duration-300", !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
          <div className="w-1 h-2.5 bg-white/80 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
