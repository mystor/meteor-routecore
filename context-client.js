Context = (function() {
  // On the client, the context is just a set of aliases for other
  // Meteor functions.  It exists only so that we can use the exact
  // same code on the client and the server
  function Context() {}

  Context.prototype.subscribe = function() {
    return Meteor.subscribe.apply(Meteor, arguments);
  }

  Context.prototype.sset = function() {
    return Session.set.apply(Session, arguments);
  }

  Context.prototype.sequals = function() {
    return Session.equals.apply(Session, arguments);
  }

  Context.prototype.sget = function() {
    return Session.get.apply(Session, arguments);
  }

  Context.prototype.ssetDefault = function() {
    return Session.setDefault.apply(Session, arguments);
  }

  Context.prototype.user = function() {
    return Meteor.user.apply(Meteor, arguments);
  }

  return Context;
})();

RouteCore._Context = Context;

