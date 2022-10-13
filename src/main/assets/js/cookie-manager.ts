import cookieManager from '@hmcts/cookie-manager';


cookieManager.init({

  cookieManifest: [
    {
      categoryName: 'essential',
      optional: false,
      cookies: [
        'i18next',
        '_oauth2_proxy',

      ]
    },
    {
      categoryName: 'analytics',
      optional: false,
      cookies: [
        '_ga',
        '_gid',
        '_gat_UA-'
      ]
    },
    {
      categoryName: 'apm',
      optional: false,
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

