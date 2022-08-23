import * as flags from '../../main/app/feature-flags/flags';

export interface CourtPageData {
  isSuperAdmin: boolean,
  slug: string,
  name: string,
  csrfToken: string,
  featureFlags?: PageFeatureFlags
}

export interface PageFeatureFlags {
  values: {
    [key: string]: boolean;
  };
  flags: typeof flags;
}

export interface SelectItem {
  value: string | number,
  text: string,
  selected: boolean
}
