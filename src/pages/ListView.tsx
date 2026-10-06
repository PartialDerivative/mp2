import { useArtworks } from '../context/artworksContext';

export default function ListView() {
  const { artworks, loading, error } = useArtworks();
  if (loading) return <p>Loading artworks…</p>;
  if (error) return <p>{error}</p>;
  return <h1>List View — {artworks.length} artworks</h1>;
}