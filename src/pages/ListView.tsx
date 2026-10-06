import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useArtworks } from '../context/artworksContext';
import { imageUrl } from '../api/artic';
import styles from './ListView.module.css';

type SortKey = 'title' | 'artist_title' | 'date_start';
type Order = 'asc' | 'desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'artist_title', label: 'Artist' },
  { value: 'date_start', label: 'Year' },
];

function isSortKey(v: string | null): v is SortKey {
  return v === 'title' || v === 'artist_title' || v === 'date_start';
}

export default function ListView() {
  const { artworks, loading, error, retry, setNavList } = useArtworks();
  const [params, setParams] = useSearchParams();

  // 从 URL 读取当前的搜索词和排序方式
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort');
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'title';
  const order: Order = params.get('order') === 'desc' ? 'desc' : 'asc';

  // 更新 URL 参数（replace: 不在浏览器历史里堆积每次按键）
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // 过滤 + 排序：全部在前端完成
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = artworks.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        (a.artist_title ?? '').toLowerCase().includes(q),
    );
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      // 空值无论升降序都排在最后
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const base =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return order === 'asc' ? base : -base;
    });
  }, [artworks, query, sortKey, order]);

  const shownIds = useMemo(() => shown.map(a => a.id), [shown]);

  if (loading) return <p className={styles.status}>Loading artworks…</p>;
  if (error) {
    return (
      <div className={styles.status}>
        <p>{error}</p>
        <button type="button" className={styles.button} onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <section>
      <h1 className={styles.heading}>Search the Collection</h1>

      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search by title or artist…"
          aria-label="Search artworks by title or artist"
          value={query}
          onChange={e => updateParam('q', e.target.value)}
        />

        <label className={styles.sortLabel}>
          Sort by
          <select
            className={styles.select}
            value={sortKey}
            onChange={e => updateParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.button}
          onClick={() => updateParam('order', order === 'asc' ? 'desc' : 'asc')}
          aria-label={`Sort order: ${order === 'asc' ? 'ascending' : 'descending'}`}
        >
          {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      <p className={styles.count}>
        Showing {shown.length} of {artworks.length} artworks
      </p>

      {shown.length === 0 ? (
        <p className={styles.status}>No artworks match “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {shown.map(a => (
            <li key={a.id}>
              <Link
                to={`/artworks/${a.id}`}
                className={styles.item}
                onClick={() => setNavList(shownIds)}
              >
                {a.image_id && (
                  <img
                    className={styles.thumb}
                    src={imageUrl(a.image_id, 200)}
                    alt={a.thumbnail?.alt_text ?? a.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className={styles.info}>
                  <h2 className={styles.title}>{a.title}</h2>
                  <p className={styles.meta}>{a.artist_title ?? 'Unknown artist'}</p>
                  <p className={styles.meta}>
                    {a.date_display ?? 'Date unknown'}
                    {a.artwork_type_title && ` · ${a.artwork_type_title}`}
                  </p>
                </div>
                <span className={styles.arrow} aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}