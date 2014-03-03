// Creates a component which allows for integration between
// Meteor and React.
//
// NOTE: Requires the blaze rendering engine
//
// - component: The Meteor template/component to render
//     if a string is passed, render that template, 
//     otherwise, directly renders the component
// 
// Usage:
//   Props passed to the component resturned by 
//   createMeteorComponent will be passed as the context
//   into the Meteor template/component which is passed in
//
function BlazeComponent(component) {
  if (!UI)
    throw new Error('createMeteorComponent requires the rendering engine blaze, it is not compatible with spark');

  var component = component;
  if (Meteor.isClient && typeof component === 'string')
    component = Template[component];

  return React.createClass({
    render: function() {
      // This is a wrapping element for the meteor component
      return React.DOM.span(null);
    },

    shouldComponentUpdate: function() {
      // All component updaing is done by Meteor
      return false;
    },

    componentDidMount: function() {
      // Create the dependency system
      // this._dep will be invalidated when props change
      var self = this;
      Deps.nonreactive(function() {
        var dep = new Deps.Dependency();
        var data = self.props;

        self._dataFn = function() {
          dep.depend();
          return data;
        };

        self._dataFn.$set = function(v) {
          dep.changed();
          data = v;
        };

        // Insert Meteor's domrange into the span element
        var parent = self.getDOMNode();
        var bound = component.extend({data: self._dataFn});
        self._child = UI.render(bound);

        UI.DomRange.insert(self._child.dom, parent);
      });
    },

    componentWillReceiveProps: function(newProps) {
      var self = this;
      Deps.nonreactive(function() {
        self._dataFn.$set(newProps);
      });
    },

    componentWillUnmount: function() {
      var self = this;
      Deps.nonreactive(function() {
        self._child.remove();
        self._child = null;
      });
    }
  });
};

RouteCore.BlazeComponent = BlazeComponent;

