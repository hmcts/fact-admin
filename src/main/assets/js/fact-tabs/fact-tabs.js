require('govuk-frontend/govuk/vendor/polyfills/Function/prototype/bind');
require('govuk-frontend/govuk/vendor/polyfills/Element/prototype/classList');
require('govuk-frontend/govuk/vendor/polyfills/Element/prototype/nextElementSibling');
require('govuk-frontend/govuk/vendor/polyfills/Element/prototype/previousElementSibling');
require('govuk-frontend/govuk/vendor/polyfills/Event');
const { nodeListForEach } = require('govuk-frontend/govuk/common');


function FactTabs ($module) {
  this.$module = $module;
  this.$tabs = $module.querySelectorAll('.fact-tabs-tab');

  this.keys = { left: 37, right: 39, up: 38, down: 40 };
  this.jsHiddenClass = 'fact-tabs-panel--hidden';
}

FactTabs.prototype.init = function () {
  if (typeof window.matchMedia === 'function') {
    this.setupResponsiveChecks();
  } else {
    this.setup();
  }
};

FactTabs.prototype.setupResponsiveChecks = function () {
  this.mql = window.matchMedia('(min-width: 40.0625em)');
  this.mql.addListener(this.checkMode.bind(this));
  this.checkMode();
};

FactTabs.prototype.checkMode = function () {
  if (this.mql.matches) {
    this.setup();
  } else {
    this.teardown();
  }
};

FactTabs.prototype.setup = function () {
  var $module = this.$module;
  var $tabs = this.$tabs;
  var $tabList = $module.querySelector('.fact-tabs-list');
  var $tabListItems = $module.querySelectorAll('.fact-tabs-list-item');

  if (!$tabs || !$tabList || !$tabListItems) {
    return;
  }

  $tabList.setAttribute('role', 'tablist');

  nodeListForEach($tabListItems, function ($item) {
    $item.setAttribute('role', 'presentation');
  });

  nodeListForEach($tabs, function ($tab) {
    // Set HTML attributes
    this.setAttributes($tab);

    // Save bounded functions to use when removing event listeners during teardown
    $tab.boundTabClick = this.onTabClick.bind(this);
    $tab.boundTabKeydown = this.onTabKeydown.bind(this);

    // Handle events
    $tab.addEventListener('click', $tab.boundTabClick, true);
    $tab.addEventListener('keydown', $tab.boundTabKeydown, true);

    // Remove old active panels
    this.hideTab($tab);
  }.bind(this));

  // Show either the active tab according to the URL's hash or the first tab
  var $activeTab = this.getTab(window.location.hash) || this.$tabs[0];
  this.setSelected($activeTab.innerText);
  var selectedTab = this.$module.querySelector('.fact-tabs-title');
  selectedTab.style.paddingTop = '0px';
  selectedTab.style.paddingBottom= '15px';

  this.showTab($activeTab);

  // Handle hashchange events
  $module.boundOnHashChange = this.onHashChange.bind(this);
  window.addEventListener('hashchange', $module.boundOnHashChange, true);


};

FactTabs.prototype.teardown = function () {
  var $module = this.$module;
  var $tabs = this.$tabs;
  var $tabList = $module.querySelector('.fact-tabs-list');
  var $tabListItems = $module.querySelectorAll('.fact-tabs-list-item');

  if (!$tabs || !$tabList || !$tabListItems) {
    return;
  }

  $tabList.removeAttribute('role');

  nodeListForEach($tabListItems, function ($item) {
    $item.removeAttribute('role', 'presentation');
  });

  nodeListForEach($tabs, function ($tab) {
    // Remove events
    $tab.removeEventListener('click', $tab.boundTabClick, true);
    $tab.removeEventListener('keydown', $tab.boundTabKeydown, true);

    // Unset HTML attributes
    this.unsetAttributes($tab);
  }.bind(this));

  // Remove hashchange event handler
  window.removeEventListener('hashchange', $module.boundOnHashChange, true);
};


FactTabs.prototype.onHashChange = function () {
  var hash = window.location.hash;
  var $tabWithHash = this.getTab(hash);
  if (!$tabWithHash) {
    return;
  }

  // Prevent changing the hash
  if (this.changingHash) {
    this.changingHash = false;
    return;
  }

  // Show either the active tab according to the URL's hash or the first tab
  var $previousTab = this.getCurrentTab();

  this.hideTab($previousTab);
  this.showTab($tabWithHash);
  this.setSelected($tabWithHash.innerText);
  var selectedTab = this.$module.querySelector('.fact-tabs-title');
  selectedTab.style.paddingTop = '0px';
  selectedTab.style.paddingBottom= '15px';
  $tabWithHash.focus();
};

FactTabs.prototype.hideTab = function ($tab) {
  this.unhighlightTab($tab);
  this.hidePanel($tab);
};

FactTabs.prototype.showTab = function ($tab) {
  this.highlightTab($tab);
  this.showPanel($tab);
};

FactTabs.prototype.getTab = function (hash) {
  return this.$module.querySelector('.fact-tabs-tab[href="' + hash + '"]');
};

FactTabs.prototype.setAttributes = function ($tab) {
  // set tab attributes
  var panelId = this.getHref($tab).slice(1);
  $tab.setAttribute('id', 'tab_' + panelId);
  $tab.setAttribute('role', 'tab');
  $tab.setAttribute('aria-controls', panelId);
  $tab.setAttribute('aria-selected', 'false');
  $tab.setAttribute('tabindex', '-1');

  // set panel attributes
  var $panel = this.getPanel($tab);
  $panel.setAttribute('role', 'tabpanel');
  $panel.setAttribute('aria-labelledby', $tab.id);
  $panel.classList.add(this.jsHiddenClass);
};

FactTabs.prototype.unsetAttributes = function ($tab) {
  // unset tab attributes
  $tab.removeAttribute('id');
  $tab.removeAttribute('role');
  $tab.removeAttribute('aria-controls');
  $tab.removeAttribute('aria-selected');
  $tab.removeAttribute('tabindex');

  // unset panel attributes
  var $panel = this.getPanel($tab);
  $panel.removeAttribute('role');
  $panel.removeAttribute('aria-labelledby');
  $panel.classList.remove(this.jsHiddenClass);
};

FactTabs.prototype.onTabClick = function (e) {
  if (!e.target.classList.contains('fact-tabs-tab')) {
    // Allow events on child DOM elements to bubble up to tab parent
    return false;
  }
  e.preventDefault();
  var $newTab = e.target;
  var $currentTab = this.getCurrentTab();
  this.hideTab($currentTab);
  this.showTab($newTab);
  this.setSelected($newTab.innerText);
  this.createHistoryEntry($newTab);
};

FactTabs.prototype.createHistoryEntry = function ($tab) {
  var $panel = this.getPanel($tab);
  // Save and restore the id
  // so the page doesn't jump when a user clicks a tab (which changes the hash)
  var id = $panel.id;
  $panel.id = '';
  this.changingHash = true;
  window.location.hash = this.getHref($tab).slice(1);
  $panel.id = id;
};

FactTabs.prototype.onTabKeydown = function (e) {
  switch (e.keyCode) {
    case this.keys.left:
    case this.keys.up:
      this.activatePreviousTab();
      e.preventDefault();
      break;
    case this.keys.right:
    case this.keys.down:
      this.activateNextTab();
      e.preventDefault();
      break;
  }
};

FactTabs.prototype.activateNextTab = function () {
  var currentTab = this.getCurrentTab();
  var nextTabListItem = currentTab.parentNode.nextElementSibling;
  if (nextTabListItem) {
    var nextTab = nextTabListItem.querySelector('.fact-tabs-tab');
  }
  if (nextTab) {
    this.hideTab(currentTab);
    this.showTab(nextTab);
    nextTab.focus();
    this.createHistoryEntry(nextTab);
  }
};

FactTabs.prototype.activatePreviousTab = function () {
  var currentTab = this.getCurrentTab();
  var previousTabListItem = currentTab.parentNode.previousElementSibling;
  if (previousTabListItem) {
    var previousTab = previousTabListItem.querySelector('.fact-tabs-tab');
  }
  if (previousTab) {
    this.hideTab(currentTab);
    this.showTab(previousTab);
    previousTab.focus();
    this.createHistoryEntry(previousTab);
  }
};

FactTabs.prototype.getPanel = function ($tab) {
  var $panel = this.$module.querySelector(this.getHref($tab));
  return $panel;
};

FactTabs.prototype.showPanel = function ($tab) {
  var $panel = this.getPanel($tab);
  $panel.classList.remove(this.jsHiddenClass);
};

FactTabs.prototype.hidePanel = function (tab) {
  var $panel = this.getPanel(tab);
  $panel.classList.add(this.jsHiddenClass);
};

FactTabs.prototype.unhighlightTab = function ($tab) {
  $tab.setAttribute('aria-selected', 'false');
  $tab.parentNode.classList.remove('fact-tabs-list-item--selected');
  $tab.setAttribute('tabindex', '-1');
};

FactTabs.prototype.highlightTab = function ($tab) {
  $tab.setAttribute('aria-selected', 'true');
  $tab.parentNode.classList.add('fact-tabs-list-item--selected');
  $tab.setAttribute('tabindex', '0');
};

FactTabs.prototype.getCurrentTab = function () {
  return this.$module.querySelector('.fact-tabs-list-item--selected .fact-tabs-tab');
};

// this is because IE doesn't always return the actual value but a relative full path
// should be a utility function most prob
// http://labs.thesedays.com/blog/2010/01/08/getting-the-href-value-with-jquery-in-ie/
FactTabs.prototype.getHref = function ($tab) {
  var href = $tab.getAttribute('href');
  var hash = href.slice(href.indexOf('#'), href.length);
  return hash;
};

FactTabs.prototype.getSelectedTab = function() {
  var text = this.$module.querySelector('.fact-tabs-title').innerText;
  return this.$module.querySelector('.fact-tabs-tab').innerText = text;
};

FactTabs.prototype.setSelected = function(string){
  var selectedTab = this.$module.querySelector('.fact-tabs-title');

  selectedTab.style.paddingTop = '20px';
  selectedTab.style.paddingBottom= '11px';
  selectedTab.setAttribute('tabindex','0');
  selectedTab.addEventListener('keydown', this.onTabEnter.bind(this), true);
  return selectedTab.innerText = string;
};



FactTabs.prototype.onTabEnter = function (e) {
  var tabList = this.$module.querySelector('.fact-tabs-list');
  if(e.key === 'Enter') {
    (tabList.style.display === "block") ? tabList.style.display = "none": tabList.style.display = "block";
  }
};

export default FactTabs;
