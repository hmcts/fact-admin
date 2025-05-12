import Tabs from './fact-tabs';

function initTabs(options = {}) {
  const scope = options.scope || document;

  const $tabs = scope.querySelectorAll('[data-module="fact-tabs"]');
  $tabs.forEach(($tab) => {
    new Tabs($tab).init();
  });
}

export {
  initTabs,
  Tabs
};
