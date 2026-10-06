import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useArtworks } from '../context/artworksContext';
import { fetchArtwork, imageUrl } from '../api/artic';
import type { Artwork } from '../types/artwork';
import styles from './DetailView.module.css';

interface NavState {
  fromApp?: boolean;
}

export default function DetailView() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0;

  const navigate = useNavigate();
  const location = useLocation();
  const { artworks, loading, navList } = useArtworks();

  // 1. 先在作品池里找
  const fromPool = useMemo(
    () => artworks.find(a => a.id === id) ?? null,
    [artworks, id],
  );

  // 2. 作品池里没有（例如直接打开 URL），就单独请求
  const [fetched, setFetched] = useState<Artwork | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);
  const needFetch = validId && !loading && !fromPool;

  useEffect(() => {
    if (!needFetch) return;
    let cancelled = false;
    fetchArtwork(id)
      .then(res => {
        if (!cancelled) setFetched(res.data);
      })
      .catch(() => {
        if (!cancelled) setFailedId(id);
      });
    return () => {
      cancelled = true;
    };
  }, [id, needFetch]);

  const artwork = fromPool ?? (fetched && fetched.id === id ? fetched : null);

  // 3. 上一个 / 下一个：按用户在列表或画廊里看到的顺序，首尾循环
  const list = navList.length > 0 ? navList : artworks.map(a => a.id);
  const index = list.indexOf(id);
  const hasNav = index !== -1 && list.length > 1;
  const prevId = hasNav ? list[(index - 1 + list.length) % list.length] : null;
  const nextId = hasNav ? list[(index + 1) % list.length] : null;

  // replace: 切换作品不堆积浏览器历史，后退一次就能回到列表
  const goTo = (targetId: number | null) => {
    if (targetId === null) return;
    navigate(`/artworks/${targetId}`, { replace: true, state: location.state });
  };

  // 键盘左右方向键切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevId !== null) {
        navigate(`/artworks/${prevId}`, { replace: true, state: location.state });
      }
      if (e.key === 'ArrowRight' && nextId !== null) {
        navigate(`/artworks/${nextId}`, { replace: true, state: location.state });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevId, nextId, navigate, location.state]);

  // 切换作品时回到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 从 App 内部点进来的才用浏览器后退（保留搜索条件），否则回首页
  const cameFromApp = Boolean((location.state as NavState | null)?.fromApp);
  const goBack = () => {
    if (cameFromApp) navigate(-1);
    else navigate('/');
  };

  const backButton = (
    <button type="button" className={styles.back} onClick={goBack}>
      ← Back
    </button>
  );

  if (!validId) {
    return (
      <div className={styles.status}>
        {backButton}
        <p>“{idParam}” is not a valid artwork ID.</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className={styles.status}>
        {backButton}
        <p>{failedId === id ? 'This artwork could not be found.' : 'Loading artwork…'}</p>
      </div>
    );
  }

  const facts: [string, string | null][] = [
    ['Date', artwork.date_display],
    ['Type', artwork.artwork_type_title],
    ['Department', artwork.department_title],
    ['Place of origin', artwork.place_of_origin],
    ['Medium', artwork.medium_display],
    ['Dimensions', artwork.dimensions],
  ];

  return (
    <article>
      <div className={styles.topBar}>
        {backButton}
        {hasNav && (
          <span className={styles.position}>
            {index + 1} / {list.length}
          </span>
        )}
      </div>

      <div className={styles.layout}>
        <div className={styles.imageWrap}>
          {artwork.image_id ? (
            <img
              className={styles.image}
              src={imageUrl(artwork.image_id, 843)}
              alt={artwork.thumbnail?.alt_text ?? artwork.title}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.noImage}>No image available</div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{artwork.title}</h1>
          <p className={styles.artist}>{artwork.artist_title ?? 'Unknown artist'}</p>

          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <dt>{label}</dt>
                <dd>{value ?? '—'}</dd>
              </div>
            ))}
          </dl>

          <a
            className={styles.external}
            href={`https://www.artic.edu/artworks/${artwork.id}`}
            target="_blank"
            rel="noreferrer"
          >
            View on artic.edu ↗
          </a>
        </div>
      </div>

      <nav className={styles.pager} aria-label="Artwork navigation">
        <button
          type="button"
          className={styles.pagerButton}
          disabled={!hasNav}
          onClick={() => goTo(prevId)}
        >
          ← Previous
        </button>
        <span className={styles.hint}>Tip: use ← → keys</span>
        <button
          type="button"
          className={styles.pagerButton}
          disabled={!hasNav}
          onClick={() => goTo(nextId)}
        >
          Next →
        </button>
      </nav>
    </article>
  );
}