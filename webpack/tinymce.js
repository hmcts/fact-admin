const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const rootExport = require.resolve('tinymce');
const root = path.resolve(rootExport, '..');
const skins = path.resolve(root, 'skins');
const themes = path.resolve(root, 'themes');
const icons = path.resolve(root, 'icons');
const plugins = path.resolve(root, 'plugins');
const models = path.resolve(root, 'models');

const copyTinyMceAssets = new CopyWebpackPlugin({
  patterns: [
    { from: skins, to: 'assets/tinymce/skins' },
    { from: themes, to: 'assets/tinymce/themes' },
    { from: icons, to: 'assets/tinymce/icons' },
    { from: plugins, to: 'assets/tinymce/plugins' },
    { from: models, to: 'assets/tinymce/models' },
  ],
});

module.exports = {
  plugins: [copyTinyMceAssets],
};
