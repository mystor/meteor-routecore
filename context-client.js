var PageContext = (function() {
  // On the client, the context is just a set of aliases for other
  // Meteor functions.  It exists only so that we can use the exact
  // same code on the client and the server

  function PageContext() {
    this.finished = false;
  }

  PageContext.prototype.subscribe = function() {
    return Meteor.subscribe.apply(Meteor, arguments);
  }

  PageContext.prototype.set = function() {
    return Session.set.apply(Session, arguments);
  }

  PageContext.prototype.equals = function() {
    return Session.equals.apply(Session, arguments);
  }

  PageContext.prototype.get = function() {
    return Session.get.apply(Session, arguments);
  }

  PageContext.prototype.setDefault = function() {
    return Session.setDefault.apply(Session, arguments);
  }

  PageContext.prototype.user = function() {
    return Meteor.user();
  }

  PageContext.prototype.userId = function() {
    return Meteor.userId();
  }

  PageContext.prototype.loggingIn = function() {
    return Meteor.loggingIn();
  }

  PageContext.prototype.redirect = function(url) {
    this.finished = true;
    page.show(url);
  }

  return PageContext;
})();

function context() {
  // Retrieves the singleton context instance.
  // This is a function rather than a property, to make it
  // consistet between the client and the server
  return RouteCore._context;
}

function bindGlobals() {
  // No-op when run on the client
  // The globals which are bound are already avaliable on the client,
  // and only need to be emulated on the server.
}

// ~~~ INTERNAL EXPORTS ~~~
RouteCore._PageContext = PageContext;

// ~~~ EXPORTS ~~~
RouteCore.context = context;
RouteCore.bindGlobals = bindGlobals;

