import { createContext, useContext } from 'react';
import type { Artwork } from '../types/artwork';

export interface ArtworksState {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  // 用户最后在列表/画廊看到的作品 ID 顺序，供详情页的上一个/下一个使用
  navList: number[];
  setNavList: (ids: number[]) => void;
  retry: () => void;
}

export const ArtworksContext = createContext<ArtworksState | null>(null);

export function useArtworks(): ArtworksState {
  const ctx = useContext(ArtworksContext);
  if (!ctx) throw new Error('useArtworks must be used inside ArtworksProvider');
  return ctx;
}