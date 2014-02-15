var context = new Context();

function _wrap (cb) {
  var self = this;

  // We wrap the callback with a Deps.autorun and
  // React's render method.
  return function(ctx) {
    if (self._computation)
      self._computation.stop();

    // We want to rerun the renderComponent function every time
    // that any dependencies update. Thanks to React's lightweight
    // virtual DOM, we can get away with this.
    self._computation = Deps.autorun(function() {
      React.renderComponent(
        cb.call(context, ctx),
        document.body
      );
    });
  }
}

function route(path, cb) {
  page(path, _wrap.call(this, cb));

  return this.reverser(path);
}

function map (fn) {
  fn.apply(this);
}

// Attach event listeners to the dom
Meteor.startup(function() {
  page();
});

// Export the map function
RouteCore.map = map;
RouteCore.route = route;

