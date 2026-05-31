import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'animalume_bgm_muted';

/**
 * BGM 再生フック
 *
 * ## ブラウザのオートプレイ制限について
 * モバイルブラウザはページロード直後の audio.play() をブロックする。
 * React の useEffect はユーザージェスチャーコンテキスト外で実行されるため
 * オートプレイが失敗しやすい。
 *
 * 対策: ensurePlaying() を返すので、呼び出し元が「確実にユーザー操作の中」
 * （ボタン tap / スワイプ完了など）で呼び出すこと。
 *
 * @example
 * const { muted, toggleMute, ensurePlaying } = useBgm('/audio/diagnosis.mp3');
 * function handleAnswer() {
 *   ensurePlaying();  // ← ここで初回再生を確定
 *   ...
 * }
 */
export function useBgm(src: string, volume = 0.5) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  // 音声要素の初期化（再生は開始しない）
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop    = true;
    audio.volume  = volume;
    audio.muted   = muted;
    audio.preload = 'auto';
    audioRef.current = audio;
    playingRef.current = false;

    // デスクトップ等ではオートプレイが通る場合もあるので試みる
    audio.play()
      .then(() => { playingRef.current = true; })
      .catch(() => { /* モバイルではブロックされる。ensurePlaying() 待ち */ });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current  = null;
      playingRef.current = false;
    };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  // ミュート状態の同期 & 永続化
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    try { localStorage.setItem(STORAGE_KEY, String(muted)); } catch { /* ignore */ }
  }, [muted]);

  /**
   * ユーザージェスチャーの中（クリック・スワイプ完了など）で呼ぶ。
   * 既に再生中なら何もしない。
   */
  const ensurePlaying = () => {
    if (playingRef.current || !audioRef.current) return;
    audioRef.current.play()
      .then(() => { playingRef.current = true; })
      .catch(() => { /* デバイスポリシーで完全にブロックされた場合は諦める */ });
  };

  const toggleMute = () => setMuted((m) => !m);

  return { muted, toggleMute, ensurePlaying };
}
