// Create the routecore object
RouteCore = {};

// Common method for reversing a route.  Will be returned when
// this.route() is called in a RouteCore.map() function.
var segment = /\/:[^:\/\?]+\??/g;

function stripSegment(s) {
  return s.replace(/[:\/\?]/g, '');
}

RouteCore.reverser = function(path) {
  var keys = path.match(segment) || [];
  keys = keys.map(stripSegment);

  return function() {
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
};

