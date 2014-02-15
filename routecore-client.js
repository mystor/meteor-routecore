function _wrap (cb) {
  var self = this;

  // We wrap the callback with a Deps.autorun and
  // React's render method.
  return function(ctx) {
    if (self._computation)
      self._computation.stop();

    self._computation = Deps.autorun(function() {
      React.renderComponent(
        cb(ctx),
        document.body
      );
    });
  }
}

function map (fn) {
  var self = this;

  fn.apply({
    route: function(path, cb) {
      page(path, _wrap.call(self, cb));
      // TODO: Return a urlFor function
    }
  });
}

// Attach event listeners to the dom
Meteor.startup(function() {
  page();
});

RouteCore = {map: map};

