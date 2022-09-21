let common = [
  'src/test/functional/features/postcode.feature',
  //'src/test/functional/features/court-types.feature',
  //'src/test/functional/features/phone-numbers.feature',
  '--require-module ts-node/register',
  '--require src/test/functional/**/*.ts',
  '--tags "not @skipped and not @pending"',
].join(' ');

module.exports = {
  default: common,
};
