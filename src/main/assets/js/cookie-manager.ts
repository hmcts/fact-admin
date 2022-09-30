import cookieManager from '@hmcts/cookie-manager';


cookieManager.init({

  cookieManifest: [
    {
      categoryName: 'essential',
      optional: false,
      cookies: [
        'i18next',
        'fact-session',
        '_oauth2_proxy'
      ]
    },
    {
      categoryName: 'analytics',
      cookies: [
        '_ga',
        '_gid',
        '_gat_UA-'
      ]
    },
    {
      categoryName: 'apm',
      cookies: [
        'dtCookie',
        'dtLatC',
        'dtPC',
        'dtSa',
        'rxVisitor',
        'rxvt'
      ]
    }
  ]
});

