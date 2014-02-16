function _wrap (cb) {
  var self = this;

  // We wrap the callback with a Deps.autorun and
  // React's render method.
  return function(ctx) {
    // Make the url field be avaliable on both the client and the server
    ctx.url = ctx.path;

    if (self._computation)
      self._computation.stop();

    // We want to rerun the renderComponent function every time
    // that any dependencies update. Thanks to React's lightweight
    // virtual DOM, we can get away with this.
    self._computation = Deps.autorun(function() {
      var context = new Context();
      var component = cb.call(context, ctx);

      // We are done (redirect occured). We can just return now
      if (context.finished)
        return;

      // No component was returned, let the server do its thing
      if (!component)
        window.location = ctx.url;

      // Render the component that was returned to the DOM
      React.renderComponent(
        component,
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

