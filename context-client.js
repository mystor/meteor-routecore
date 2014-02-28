Context = (function() {
  // On the client, the context is just a set of aliases for other
  // Meteor functions.  It exists only so that we can use the exact
  // same code on the client and the server
  function Context() {
    this.finished = false;
  }

  Context.prototype.subscribe = function() {
    return Meteor.subscribe.apply(Meteor, arguments);
  }

  Context.prototype.set = function() {
    return Session.set.apply(Session, arguments);
  }

  Context.prototype.equals = function() {
    return Session.equals.apply(Session, arguments);
  }

  Context.prototype.get = function() {
    return Session.get.apply(Session, arguments);
  }

  Context.prototype.setDefault = function() {
    return Session.setDefault.apply(Session, arguments);
  }

  Context.prototype.user = function() {
    return Meteor.user();
  }

  Context.prototype.userId = function() {
    return Meteor.userId();
  }

  Context.prototype.loggingIn = function() {
    return Meteor.loggingIn();
  }

  Context.prototype.redirect = function(url) {
    this.finished = true;
    page.show(url);
  }

  return Context;
})();

RouteCore._Context = Context;
RouteCore.bindGlobals = function() {/* NO-OP on client */};

