import { Link, useSearchParams } from 'react-router-dom';
import { useArtworks } from '../context/artworksContext';
import { imageUrl } from '../api/artic';
import styles from './GalleryView.module.css';

const SEP = '|';

// 从 URL 里读取已选中的筛选值，例如 types=Painting|Print
function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  return raw ? raw.split(SEP) : [];
}

// 统计每个类别出现的次数，按数量从多到少排序
function countBy(values: (string | null)[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

interface FilterGroupProps {
  label: string;
  options: [string, number][];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ label, options, selected, onToggle }: FilterGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.tags}>
        {options.map(([value, count]) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={active ? `${styles.tag} ${styles.tagActive}` : styles.tag}
              aria-pressed={active}
              onClick={() => onToggle(value)}
            >
              {value} <span className={styles.tagCount}>{count}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function GalleryView() {
  const { artworks, loading, error, retry, setNavList } = useArtworks();
  const [params, setParams] = useSearchParams();

  const selectedTypes = readList(params, 'types');
  const selectedDepts = readList(params, 'depts');

  const toggle = (key: string, value: string) => {
    const current = readList(params, key);
    const nextList = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    const next = new URLSearchParams(params);
    if (nextList.length > 0) next.set(key, nextList.join(SEP));
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  if (loading) return <p className={styles.status}>Loading gallery…</p>;
  if (error) {
    return (
      <div className={styles.status}>
        <p>{error}</p>
        <button type="button" className={styles.clear} onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  const typeOptions = countBy(artworks.map(a => a.artwork_type_title));
  const deptOptions = countBy(artworks.map(a => a.department_title));

  // 组内 OR，组间 AND
  const shown = artworks.filter(
    a =>
      (selectedTypes.length === 0 ||
        (a.artwork_type_title !== null && selectedTypes.includes(a.artwork_type_title))) &&
      (selectedDepts.length === 0 ||
        (a.department_title !== null && selectedDepts.includes(a.department_title))),
  );
  const shownIds = shown.map(a => a.id);
  const hasFilters = selectedTypes.length > 0 || selectedDepts.length > 0;

  return (
    <section>
      <h1 className={styles.heading}>Gallery</h1>

      <div className={styles.filters}>
        <FilterGroup
          label="Artwork type"
          options={typeOptions}
          selected={selectedTypes}
          onToggle={v => toggle('types', v)}
        />
        <FilterGroup
          label="Department"
          options={deptOptions}
          selected={selectedDepts}
          onToggle={v => toggle('depts', v)}
        />
      </div>

      <div className={styles.summary}>
        <span>
          Showing {shown.length} of {artworks.length} artworks
        </span>
        {hasFilters && (
          <button type="button" className={styles.clear} onClick={clearAll}>
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className={styles.status}>No artworks match the selected filters.</p>
      ) : (
        <ul className={styles.grid}>
          {shown.map(a => (
            <li key={a.id}>
              <Link
                to={`/artworks/${a.id}`}
                state={{ fromApp: true }}
                className={styles.card}
                onClick={() => setNavList(shownIds)}
              >
                {a.image_id && (
                  <img
                    className={styles.image}
                    src={imageUrl(a.image_id, 400)}
                    alt={a.thumbnail?.alt_text ?? a.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className={styles.caption}>
                  <span className={styles.title}>{a.title}</span>
                  <span className={styles.artist}>{a.artist_title ?? 'Unknown artist'}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}