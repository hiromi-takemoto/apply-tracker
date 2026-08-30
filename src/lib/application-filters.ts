import {
  GENRE_LABELS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type ApplicationPlatform,
  type ApplicationStatus,
  type GenreMajor,
} from "./applications";

export type ApplicationFilters = {
  status?: ApplicationStatus;
  platform?: ApplicationPlatform;
  genre?: GenreMajor;
};

export type FilterSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseApplicationFilters(params: FilterSearchParams): ApplicationFilters {
  const status = first(params.status);
  const platform = first(params.platform);
  const genre = first(params.genre);

  return {
    ...(status && status in STATUS_LABELS ? { status: status as ApplicationStatus } : {}),
    ...(platform && platform in PLATFORM_LABELS ? { platform: platform as ApplicationPlatform } : {}),
    ...(genre && genre in GENRE_LABELS ? { genre: genre as GenreMajor } : {}),
  };
}

export function filtersFromUrlSearchParams(params: URLSearchParams): ApplicationFilters {
  return parseApplicationFilters({
    status: params.get("status") ?? undefined,
    platform: params.get("platform") ?? undefined,
    genre: params.get("genre") ?? undefined,
  });
}

export function applicationFiltersQuery(filters: ApplicationFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.genre) params.set("genre", filters.genre);
  return params.toString();
}

type FilterableQuery<T> = { eq(column: string, value: string): T };

export function applyApplicationFilters<T extends FilterableQuery<T>>(
  query: T,
  filters: ApplicationFilters,
): T {
  let filtered = query;
  if (filters.status) filtered = filtered.eq("status", filters.status);
  if (filters.platform) filtered = filtered.eq("platform", filters.platform);
  if (filters.genre) filtered = filtered.eq("genre_major", filters.genre);
  return filtered;
}
