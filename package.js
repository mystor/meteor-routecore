Package.describe({
  name: 'mystor:routecore',
  summary: 'client and server side rendering/routing powered by React',
  version: '0.2.0',
  git: 'https://github.com/mystor/meteor-routecore.git'
});

Npm.depends({
  'connect': '2.13.0',
  'connect-route': '0.1.4',
  'react': '0.13.1'
});

Package._transitional_registerBuildPlugin({
  name: 'compileJSX',
  use: [],
  sources: [
    'plugin/compile-jsx.js'
  ],
  npmDependencies: {
    'react-tools': '0.13.1'
  }
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@0.9.0');

  api.use(['deps', 'tmeasday:page-js-ie-support@1.3.5'], 'client');
  api.use('tmeasday:html5-history-api@4.1.2', 'client', {weak: true});
  api.use('webapp', 'server');
  api.use('meteorhacks:fast-render@1.0.0', ['client', 'server']);
  api.use('iron:dynamic-template@0.3.0', 'client');

  api.add_files('react-with-addons-0.13.1.js', ['client', 'server']);

  api.add_files('routecore-common.js', ['client', 'server']);
  api.add_files('context-client.js', 'client');
  api.add_files('context-server.js', 'server');
  api.add_files('routecore-client.js', 'client');
  api.add_files('routecore-server.js', 'server');

  api.add_files('blaze-component.js', ['client', 'server']);
  api.add_files('reactivity.js', ['client', 'server']);

  api.add_files('body.html', ['client']);

  // fast-render needs to be visible to the app, as the
  // inline javascript which fast-render pushes to the client
  // needs to interact with an exported value.
  api.imply('meteorhacks:fast-render@1.0.0', ['client', 'server']);
  api.export('RouteCore', ['client', 'server']);
  // api.export('React'); -- unnecessary (react mutates global obj)
});
