"use client";

import { useRef, useState } from "react";
import { track } from "@/components/tracker";
import type { SegmentVideo } from "@/lib/segment-proof";

/**
 * Player leve: mostra só a capa e carrega o vídeo no clique, para a página de
 * anúncio não pagar o peso do player antes da hora. Toca do YouTube (iframe)
 * ou um arquivo do próprio site (`<video>` nativo).
 */
export function LiteVideo({
  video,
  title,
  playLabel,
}: {
  video: SegmentVideo;
  title: string;
  playLabel: string;
}) {
  if ("src" in video) {
    return <FileVideo src={video.src} poster={video.poster} title={title} playLabel={playLabel} />;
  }
  return <YouTubeVideo youtubeId={video.youtubeId} title={title} playLabel={playLabel} />;
}

function FileVideo({
  src,
  poster,
  title,
  playLabel,
}: {
  src: string;
  poster: string;
  title: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  function start() {
    setPlaying(true);
    track("video_play", { label: title });
    // play() dentro do clique: o iPhone só deixa tocar com som a partir de um toque
    ref.current?.play().catch(() => {
      // sem permissão para tocar sozinho: os controles nativos ficam na tela para o play manual
    });
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-[10px] border border-line bg-navy-950">
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="none"
        controls={playing}
        playsInline
        title={title}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
      {!playing && (
        <button
          type="button"
          onClick={start}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <PlayBadge />
        </button>
      )}
    </div>
  );
}

function YouTubeVideo({
  youtubeId,
  title,
  playLabel,
}: {
  youtubeId: string;
  title: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[10px] border border-line bg-navy-950">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setPlaying(true);
            track("video_play", { label: title });
          }}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* capa servida pelo YouTube; next/image exigiria liberar o domínio */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <PlayBadge />
        </button>
      )}
    </div>
  );
}

function PlayBadge() {
  return (
    <>
      <span className="absolute inset-0 bg-[#0b1526]/35 transition group-hover:bg-[#0b1526]/20" aria-hidden />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white transition group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </>
  );
}
