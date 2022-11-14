let common = [
  //'src/test/functional/features/viewer/*.feature',
  'src/test/functional/features/super_admin/opening-hours.feature',
  'src/test/functional/features/super_admin/facilities.feature',
  'src/test/functional/features/super_admin/postcodes.feature',
  'src/test/functional/features/admin/court-urgent.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
