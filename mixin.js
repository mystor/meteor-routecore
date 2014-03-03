if (Meteor.isServer)
  var Fiber = Npm.require('fibers');


// This createClass overrides the render method of the passed in spec,
// calling getMeteorSubscriptions and getMeteorData, and then delegating 
// to the correct component/the actual provided render call.
function createClass(spec) {
  var newSpec = _.extend({}, spec, {
    render: function() {
      // Handle subscriptions and displaying of loading templates (if applicable)
      if (typeof this.getMeteorSubscriptions === 'function') {
        var subs = [];

        var ctx = {
          subscribe: function() {
            var handle;

            if (Meteor.isClient) {
              handle = Meteor.subscribe.apply(Meteor, arguments);
            } else {
              try {
                var context = Fiber.current._routeCoreContext;
                handle = context.subscribe.apply(context, arguments);
              } catch (err) {
                throw new Error("Can only call subscribe when in a RouteCore Fiber");
              }
            }

            return {
              wait: function() {
                subs.push(handle);
              },
              ready: function() {
                return handle.ready();
              },
              stop: function() {
                return handle.stop();
              }
            };
          }
        };

        // Get the subscriptions which we need to subscribe to
        this.getMeteorSubscriptions(ctx);

        this.subsReady = subs.every(function(h) {return h.ready()});

        if (!this.subsReady) {
          if (this.loadingComponent)
            return this.loadingComponent(null);
          else if (RouteCore.loadingComponent)
            return RouteCore.loadingComponent(null);
        }
      }

      // Get meteor data, and check if it is null/undefined,
      // if it is null/undefined, we know 
      if (typeof this.getMeteorData === 'function') {
        this.data = this.getMeteorData();

        if (this.data === null || typeof data === 'undefined') {
          if (this.notFoundComponent)
            return this.notFoundComponent(null);
          else if (RouteCore.loadingComponent)
            return RouteCore.loadingComponent(null);
        }
      }

      // We didn't decide to render a different template, 
      // now we call the provided render method.
      return spec.render.apply(this, arguments);
    }
  });
}

RouteCore.createClass = createClass;

