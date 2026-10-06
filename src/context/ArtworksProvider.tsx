import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchArtworkPool } from '../api/artic';
import type { Artwork } from '../types/artwork';
import { ArtworksContext } from './artworksContext';

export function ArtworksProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navList, setNavList] = useState<number[]>([]);
  const [attempt, setAttempt] = useState(0);

  // App 启动时只请求一次（相当于缓存），失败后可以 retry
  useEffect(() => {
    let cancelled = false;
    fetchArtworkPool()
      .then(({ artworks }) => {
        if (!cancelled) setArtworks(artworks);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load artworks from the Art Institute of Chicago API.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt(a => a + 1);
  };

  return (
    <ArtworksContext.Provider
      value={{ artworks, loading, error, navList, setNavList, retry }}
    >
      {children}
    </ArtworksContext.Provider>
  );
}