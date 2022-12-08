let common = [
  'src/test/functional/features/viewer/*.feature',
  'src/test/functional/features/admin/*.feature',
  'src/test/functional/features/super_admin/court-lock.feature',
  'src/test/functional/features/super_admin/postcodes.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
