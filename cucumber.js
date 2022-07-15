let common = [
  'src/test/functional/features/admin-create-user.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
