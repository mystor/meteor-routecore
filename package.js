Package.describe({
  summary: 'Server & Client-side routing with React'
});

Npm.depends({
  'connect': '2.7.10',
  'connect-route': '0.1.4'
});

Package._transitional_registerBuildPlugin({
  name: 'compileJSX',
  use: [],
  sources: [
    'plugin/compile-jsx.js'
  ],
  npmDependencies: {
    'react-tools': '0.8.0'
  }
});

Package.on_use(function (api) {
  api.use(['deps', 'page-js-ie-support'], 'client');
  api.use('webapp', 'server');
  api.use('fast-render', ['client', 'server']);

  api.add_files('react.js', ['client', 'server']);

  api.add_files('routecore-common.js', ['client', 'server']);
  api.add_files('context-client.js', 'client');
  api.add_files('context-server.js', 'server');
  api.add_files('routecore-client.js', 'client');
  api.add_files('routecore-server.js', 'server');

  api.export('RouteCore', ['client', 'server']);
  // api.export('React'); -- unnecessary (react mutates global obj)
});

