import $ from 'jquery';

export function setUpTabClick(tab: string, callback: Function) {
  $(tab).on('click', e => {
    e.preventDefault();
    callback();
  });
}

