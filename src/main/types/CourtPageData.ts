export interface CourtPageData {
  isSuperAdmin: boolean,
  slug: string,
  name: string,
  csrfToken: string,
  featureFlags?: PageFeatureFlags,
  error?: PageError
}

export interface PageError {
  [key: string]: {
    message: string;
  };
}

export interface PageFeatureFlags {
  values: {
    [key: string]: boolean;
  };
}

export interface SelectItem {
  value: string | number,
  text: string,
  selected: boolean
}
