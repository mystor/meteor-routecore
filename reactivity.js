var rawCreateClass = React.createClass;

// This is an alternate createClass method. It wraps the passed in render
// method within a Meteor computation, such that any reactive data sources
// which are used in the render method will cause the component to re-render
function createClass(spec) {
  var render = spec.render;

  // Add a mixin to the specification to manage the 
  // _computation over the lifecycle of the component.
  spec.mixins = spec.mixins || [];
  spec.mixins.push({
    componentWillMount: function() {
      // We need to create the reactive computation for
      // this component. The render method will always
      // be run in a reactive computation.
      if (Meteor.isClient) {
        var self = this;
        this._computation = Deps.autorun(function() {
          if (self._rendering) {
            self._rendered = render.apply(self, []);
          } else {
            Deps.nonreactive(function() {
              self.forceUpdate();
            });
          }
        });
      }
    },

    componentWillUnmount: function() {
      // Clean up the computation
      if (this._computation) {
        this._computation.stop();
        this._computation = null;
      }
    }
  });

  spec.render = function() {
    // Forces the computation to recompute, and then 
    // returns the stashed _renderedValue

    if (this._computation) {
      // Re-run the computation!
      // The computation sets the this._rendered property to
      // the return value of running render()
      this._rendering = true;

      this._computation._recomputing = true; // Makes invalidate() not queue an invalidate
      this._computation.invalidate();
      this._computation._recompute();

      this._rendering = false;
    } else {
      // We don't have a computation, just run the render method
      return render.apply(this, []);
    }

    // Get the stored _renderedValue, and return it.
    var ret = this._rendered;
    this._rendered = null;
    return ret;
  };

  return rawCreateClass.call(React, spec);
}

RouteCore.createClass = createClass;
// XXX: Should React.createClass be overridden?
React.createClass = createClass;

