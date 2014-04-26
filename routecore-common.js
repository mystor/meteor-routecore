// Common method for reversing a route.  Will be returned when
// this.route() is called in a RouteCore.map() function.
var segment = /\/:[^:\/\?]+\??/g;

function stripSegment(s) {
  return s.replace(/[:\/\?]/g, '');
}

function reverser(path) {
  // Returns a function which reverses the path spec, returning a full URL

  var keys = path.match(segment) || [];
  keys = keys.map(stripSegment);

  var reverse = function() {
    var obj;

    if (typeof arguments[0] === 'object'
        && arguments.length === 1) {
      obj = arguments[0];
    } else {
      obj = {};
      for (var i=0; i < arguments.length; i++) {
        if (i > keys.length) {
          console.warn('warn: reverse recieved more parameters than variable path segments');
          break;
        }

        obj[keys[i]] = arguments[i];
      }
    }

    return path.replace(segment, function(seg) {
      seg = stripSegment(seg);
      return obj[seg] ? '/' + obj[seg] : '';
    });
  };

  reverse.go = function() {
    RouteCore.go(this.apply(this, arguments));
  };

  return reverse;
}

function route(path, handler) {
  // Common method for adding a route
  // Delegates to the platform-specific _rawRoute once
  // it has transformed the handler into a function.
  //
  // Accepts:
  //  - React component spec
  //  - React component
  //  - Callback function

  if (typeof handler === 'object') {
    // We have received an object, we will use it
    // as a spec to create a react component

    return this.route(path, React.createClass(handler));
  } else if (typeof handler === 'function') {
    if (handler.originalSpec) {
      // We have received react component!
      // We attach a generic function callback which will
      // render the react component which was passed in

      return this.route(path, function(ctx) {
        return handler(ctx.params);
      });
    } else {
      // We have received a raw callback!
      // Delegate to the platform-specific code

      this._rawRoute(path, handler);
      return this.reverser(path);
    }
  } else {
    throw new TypeError('Invalid handler type for route: ' + path);
  }
}

function map(fn) {
  // Binds the context to the RouteCore object.
  // Means that the route() function can be called as
  // `this.route()`

  fn.apply(this);
}

function go(url) {
  // Programmatically redirects the user to the gievn url
  // If the url is of the correct form, the redirect will be
  // seamless.

  var context = this.context();
  context.redirect(url);
}

// ~~~ EXPORTS ~~~
RouteCore = {
  reverser: reverser,
  route: route,
  map: map,
  go: go
};

