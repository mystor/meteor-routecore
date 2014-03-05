// Create a singleton context instance.
// This makes sense, as the entire environment is one page
var context = new RouteCore._PageContext();

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

function rawRoute(path, cb) {
  page(path, _wrap.call(this, cb));
}

// Attach event listeners to the dom
Meteor.startup(function() {
  page();
});

// ~~~ INTERNAL EXPORTS ~~~
RouteCore._rawRoute = rawRoute;
RouteCore._context = context;

