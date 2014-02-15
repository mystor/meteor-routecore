var connectRoute = Npm.require('connect-route'),
    connectHandlers = WebApp.connectHandlers,
    router,
    middleware = connectRoute(function (r) {router = r;});

function _wrap (cb) {
  var self = this;

  // We wrap the callback with React's render method,
  // as well as then pushing the response to the client
  return function(req, res, next) {
    var headers = {
      'Content-Type': 'text/html; charset=utf-8'
    };

    React.renderComponentToString(cb(req), function(s) {
      var requestSpecificHtml = boilerplateHtml.replace('</body>', s + '</body>');

      res.writeHead(200, headers);
      res.write(requestSpecificHtml);
      res.end();
    });
  }
}

function map (fn) {
  var self = this;
  
  fn.apply({
    route: function(path, cb) {
      router.get(path, _wrap.call(self, cb));
      // TODO: Return a function which returns a route to the resource
    }
  });
}

// TODO: Add a lower level map for server-only resources

// Attach our middleware to the Meteor pipeline
Meteor.startup(function() {
  setTimeout(function () {
    connectHandlers.use(middleware);
  })
});

RouteCore = {map: map};

