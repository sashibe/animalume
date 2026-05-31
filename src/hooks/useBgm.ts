import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'animalume_bgm_muted';

/**
 * BGM 再生フック
 * - ループ再生・ミュートトグル・ミュート設定の localStorage 永続化
 * - ブラウザのオートプレイ制限に対応（ユーザー操作後に再生開始）
 * - コンポーネントアンマウント時に自動停止
 */
export function useBgm(src: string, volume = 0.35) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // 音声要素の初期化 & 再生開始
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = muted;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().catch(() => {
        // オートプレイがブロックされた場合は最初のタップ/クリックで再生
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', resume);
          document.removeEventListener('touchstart', resume);
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
      });
    };
    tryPlay();

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  // ミュート状態の同期 & 永続化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
      // ignore
    }
  }, [muted]);

  const toggleMute = () => setMuted((m) => !m);

  return { muted, toggleMute };
}
