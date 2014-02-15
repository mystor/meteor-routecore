Package.describe({
  summary: 'HTML5 Routing Core'
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

Package.on_use(function (api, where) {
  Npm.depends({
    'connect': '2.7.10',
    'connect-route': '0.1.4'
  });

  api.use('deps', 'client');
  api.use('jquery', 'client');
  api.use('page-js-ie-support', 'client');
  api.use('webapp', 'server');

  // Load react!
  api.add_files('react.js', ['client', 'server']);

  // Client side routing wrapper
  api.add_files('routecore-client.js', 'client');

  // Server side routing wrapper
  api.add_files('boilerplateHtml.js', 'server');
  api.add_files('routecore-server.js', 'server');
  api.add_files('server-stubs.js', 'server');

  api.export('RouteCore', ['client', 'server']);
  // api.export('React'); -- unnecessary (react sets global obj)
});

