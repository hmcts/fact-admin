let common = [
  'src/test/functional/features/opening-hours.feature',
  'src/test/functional/features/courts.feature',
  //'src/test/functional/features/facilities.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
