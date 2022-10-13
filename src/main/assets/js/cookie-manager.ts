import cookieManager from '@hmcts/cookie-manager';

// @ts-ignore
cookieManager.on('UserPreferencesLoaded', (preferences) => {
  // @ts-ignore
  const dataLayer = window.dataLayer || [];
  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
});

// @ts-ignore
cookieManager.on('UserPreferencesSaved', (preferences) => {
  // @ts-ignore
  const dataLayer = window.dataLayer || [];
  // @ts-ignore
  const dtrum = window.dtrum;

  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});

  if(dtrum !== undefined) {
    if(preferences.apm === 'on') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
});


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

