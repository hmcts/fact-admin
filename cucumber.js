let common = [
  'src/test/functional/features/super_admin/admin-audit.feature',
  'src/test/functional/features/admin/admin-login.feature',
  'src/test/functional/features/super_admin/additional-links.feature',
  'src/test/functional/features/admin/courts.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
