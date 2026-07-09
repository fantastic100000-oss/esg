import type { SiteId } from '../types';

/** 사업장별 고정 카테고리 색상 (전 차트 공통 - 동일 사업장은 항상 동일 색상) */
export const SITE_COLOR: Record<SiteId, string> = {
  hq: '#2a78d6', // blue
  ck: '#1baf7a', // aqua
  logistics: '#eda100', // yellow
  catering: '#008300', // green
};

export const CHART_INK = {
  text: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
};

export const STATUS_COLOR = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};
