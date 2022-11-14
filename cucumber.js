let common = [
  //'src/test/functional/features/viewer/*.feature',
  'src/test/functional/features/super_admin/email-addresses.feature',
  'src/test/functional/features/super_admin/facilities.feature',
  'src/test/functional/features/super_admin/postcodes.feature',
  'src/test/functional/features/admin/courts.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
