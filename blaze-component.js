function BlazeComponent(component) {
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
  //   BlazeComponent will be passed as the context
  //   into the Meteor template/component which is passed in

  if (!UI)
    throw new Error('BlazeComponent requires the rendering engine blaze, it is not compatible with spark');

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
      this._dynamicTmpl = new Iron.DynamicTemplate();
      this._dynamicTmpl.template(component);
      this._dynamicTmpl.data(this.props);
      this._dynamicTmpl.insert({ el: this.getDOMNode() });
    },

    componentWillReceiveProps: function(newProps) {
      this._dynamicTmpl.data(newProps);
    },

    componentWillUnmount: function() {
      this._dynamicTmpl.destroy();
      this._dynamicTmpl = null;
    }
  });
};

// ~~~ EXPORTS ~~~
RouteCore.BlazeComponent = BlazeComponent;
