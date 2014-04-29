Package.describe({
  summary: 'client and server side rendering/routing powered by React'
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
  api.use('HTML5-History-API', 'client', {weak: true});
  api.use('webapp', 'server');
  api.use('fast-render', ['client', 'server']);

  api.add_files('react-with-addons.js', ['client', 'server']);

  api.add_files('routecore-common.js', ['client', 'server']);
  api.add_files('context-client.js', 'client');
  api.add_files('context-server.js', 'server');
  api.add_files('routecore-client.js', 'client');
  api.add_files('routecore-server.js', 'server');

  api.add_files('blaze-component.js', ['client', 'server']);
  api.add_files('reactivity.js', ['client', 'server']);

  // fast-render needs to be visible to the app, as the
  // inline javascript which fast-render pushes to the client
  // needs to interact with an exported value.
  api.imply('fast-render', ['client', 'server']);
  api.export('RouteCore', ['client', 'server']);
  // api.export('React'); -- unnecessary (react mutates global obj)
});

