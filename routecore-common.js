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

  return function(obj) {
    if (!obj || (typeof obj !== 'object')) {
      obj = {};
      for (var i=0; i<arguments.length; i++) {
        if (i > keys.length) {
          console.warn('warn: reverse recieved more parameters than variable path segments');
          break;
        }

        obj[keys[i]] = arguments[i];
      }
    }

    return path.replace(segment, function(m, s) {
      s = stripSegment(s);
      return obj[s] ? '/' + obj[s] : '';
    });
  };
};

