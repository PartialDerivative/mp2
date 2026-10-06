import axios from 'axios';
import type { Artwork, SearchResponse, DetailResponse } from '../types/artwork';

// 统一的 axios 实例，所有请求都从这里发出
const api = axios.create({
  baseURL: 'https://api.artic.edu/api/v1',
  timeout: 15000,
});

// 只请求需要的字段，响应更小更快
const FIELDS = [
  'id', 'title', 'artist_title', 'date_start', 'date_display', 'image_id',
  'artwork_type_title', 'department_title', 'place_of_origin',
  'medium_display', 'dimensions', 'thumbnail',
].join(',');

const PAGES = 2;   // 拉 2 页
const LIMIT = 100; // 每页 100 件（API 上限）

// 图片服务器的正式地址
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

// 拉取"作品池"：公有领域作品，过滤掉没有图片的
export async function fetchArtworkPool(): Promise<{ artworks: Artwork[]; iiifUrl: string }> {
  const requests = Array.from({ length: PAGES }, (_, i) =>
    api.get<SearchResponse>('/artworks/search', {
      params: {
        'query[term][is_public_domain]': true,
        fields: FIELDS,
        limit: LIMIT,
        page: i + 1,
      },
    })
  );
  const responses = await Promise.all(requests);

  const all = responses.flatMap(r => r.data.data);
  // 去重（以防两页有重复）并过滤无图作品
  const seen = new Set<number>();
  const artworks = all.filter(a => {
    if (!a.image_id || seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return { artworks, iiifUrl: IIIF_BASE };
}

// 拉取单件作品（用户直接打开详情页 URL 时用）
export async function fetchArtwork(id: number): Promise<DetailResponse> {
  const res = await api.get<DetailResponse>(`/artworks/${id}`, {
    params: { fields: FIELDS },
  });
  return res.data;
}

// 拼接图片地址：width 用官方推荐的 200/400/600/843
export function imageUrl(imageId: string, width = 400): string {
  return `${IIIF_BASE}/${imageId}/full/${width},/0/default.jpg`;
}