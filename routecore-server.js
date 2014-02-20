var connect = Npm.require('connect'),
    connectRoute = Npm.require('connect-route'),
    http = Npm.require('http'),
    Fiber = Npm.require('fibers'),
    connectHandlers = WebApp.connectHandlers,
    router,
    middleware = connectRoute(function (r) {router = r;});

function _wrap (cb) {
  var self = this;

  return function(req, res, next) {
    // We can do this, as we wrap after a cookieParser()
    var loginToken = req.cookies['meteor_login_token'];

    Fiber(function() {
      var context = new Context(loginToken, req, res);

      try {
        // Run the request
        var component = cb.call(context, req);

        // The response was accessed in the callback, and used to
        // send data directly to the client.  We are done.
        if (res.finished)
          return;

        // No component was returned, we don't bother rendering and
        // instead let the rest of the system run its course
        if (!component) {
          next();
          return;
        }

        // Render the html
        React.renderComponentToString(component, function(html) {
          res.bodyHtml = html;

          // Save the query data
          // TODO: Make this merge with queryData potentially already in req
          res.queryData = context._frContext.getData();
          if (res.queryData)
            res.queryData.serverRoutePath = req.url;

          // Move on to the next middleware
          next();
        });
      } catch (err) {
        console.error('Error while rendering path: ' + req.url +' ; error: ' + err.stack);
        next();
      }
    }).run();
  };
}

// Hijack Meteor's html return
// We will check if we previously rendered some html
// and will inject it into the request if necessary
var originalWrite = http.OutgoingMessage.prototype.write;
http.OutgoingMessage.prototype.write = function(chunk, encoding) {
  // Make sure we rendered something
  if (this.bodyHtml && !this.htmlInjected) {
    if (!(/<!DOCTYPE html>/.test(chunk) && encoding === undefined)) {
      // Non-app url (we would clobber non-html resources)
      console.warn('warn: react-server route on non-app URL, route ignored');
    } else if (this._headers['access-control-allow-origin']) {
      // CORS headers are set - potential for security holes - disable
      console.warn('warn: server-render turned off due to CORS headers');
    } else {
      // Inject!
      chunk = chunk.replace('<body>', '<body>\n' + this.bodyHtml + '\n');

      this.htmlInjected = true;
    }
  }

  originalWrite.call(this, chunk, encoding);
};

function route(path, cb) {
  router.get(path, _wrap.call(this, cb));

  return this.reverser(path);
}

function map (fn) {
  fn.apply(this);
}

// Attach our middleware to the Meteor pipeline
Meteor.startup(function() {
  setTimeout(function () {
    connectHandlers
      .use(connect.cookieParser())
      .use(middleware);
  })
});

RouteCore.map = map;
RouteCore.route = route;

