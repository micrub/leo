import path from 'path';
import webpackRequire from 'utils/webpack-require';
import findLeorcPath from 'utils/find-leorc-path';
import config from 'leo-graphql/webpack.config.graphql';
import evaluate from 'eval';

import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import oDebug from 'debug';
const debug = oDebug('leo:graphql:database');

export function genDatabase(conf, callback) {

  debug('files', conf.files);
  const compiler = webpack(config(conf.files, conf.plugins).resolve());
  var fs = new MemoryFS();
  fs.mkdirpSync('/dist');
  compiler.outputFileSystem = fs;
  compiler.watch({
    aggregateTimeout: 300
  }, (err, stats) => {
    /**
     * Start Error Checking
     */
    if (err) {
      // hard failure
      debug('webpack failed', err);
      return console.error(err);
    }
    const jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) {
      //soft failure
      debug('webpack stats errors', jsonStats.errors[0])
        return console.warn(jsonStats.errors);
    }
    if (jsonStats.warnings.length > 0) {
      debug('webpack stats warnings', jsonStats.warnings)
        return console.warn(jsonStats.warnings);
    }
    /**
     * End Error Checking
     */
    debug('dist output', fs.readdirSync('/dist'));
    const str = fs.readFileSync('/dist/bundle.js').toString('utf-8');
    callback(null, {
      data: evaluate(str, 'api-database.json', null, true),
      plugins: conf.plugins
    });
  })
}
