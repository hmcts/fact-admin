
export interface I18n {
  i18n: {
    getDataByLanguage: (lng: string) => {
      home: {};
      'not-found': {},
      error: {},
      courts: {},
      template: {}
    }
  }
  lng: string
}

export type I18nRequest = Request & I18n;
