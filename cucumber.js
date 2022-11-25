let common = [
  //'src/test/functional/features/viewer/*.feature',
  'src/test/functional/features/super_admin/local-authorities.feature',
  //'src/test/functional/features/admin/*.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
