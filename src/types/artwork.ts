// 一件作品的数据结构（只包含我们请求的字段）
// API 对空字段返回 null，所以很多字段要写 | null
export interface Artwork {
  id: number;
  title: string;
  artist_title: string | null;
  date_start: number | null;
  date_display: string | null;
  image_id: string | null;
  artwork_type_title: string | null;
  department_title: string | null;
  place_of_origin: string | null;
  medium_display: string | null;
  dimensions: string | null;
  thumbnail: { alt_text: string | null } | null;
}

// 搜索接口返回的整体结构
export interface SearchResponse {
  data: Artwork[];
  pagination: { total: number; total_pages: number; current_page: number };
  config: { iiif_url: string };
}

// 单个作品接口返回的结构
export interface DetailResponse {
  data: Artwork;
  config: { iiif_url: string };
}