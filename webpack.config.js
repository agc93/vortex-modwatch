let webpack = require('vortex-api/bin/webpack').default;
var config = webpack('vortex-showcase-modwatch', __dirname, 4);
// config.externals['vortex-showcase-api'] = 'vortex-showcase-api';
module.exports = config;