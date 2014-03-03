var Fiber = Npm.require('fibers');

Context = (function() {

  function Context(loginToken, req, res) {
    this._sessionData = {};
    this.request = req;
    this.response = res;
    this._frContext = new FastRender._Context(loginToken);
  }

  // The subscribe function on the client returns an object with a
  // ready() and stop() method.  As we want to share code between
  // the client and the server, we need to make the subscribe function
  // return a object with these methods.
  Context.prototype.subscribe = function() {
    this._frContext.subscribe.apply(this._frContext, arguments);

    return {
      ready: function() {return true;},
      stop: function() {}
    };
  };

  // We want to allow the session object to be accessed and manipulated
  // on the server, so we implement a non-reactive version of session.
  // We don't send this data to the server (like fast-render), because
  // we assume that the route function is idempotent.  The session should
  // be identically recreated on the client.
  Context.prototype.set = function(k, v) {
    this._sessionData[k] = v;
  }

  Context.prototype.equals = function(k, v) {
    return this._sessionData[k] === v;
  }

  Context.prototype.get = function(k) {
    return this._sessionData[k];
  }

  Context.prototype.setDefault = function(k, v) {
    if (!this._sessionData[k])
      this._sessionData[k] = v;
  }

  // The FastRender context uses a userId field on the context to store
  // the id of the current user.  We can use this to emulate the Meteor.user()
  // reactive data source.
  Context.prototype.user = function() {
    return Meteor.users.findOne({_id: this.userId()}, {
      fields: {
        _id: 1,
        username: 1,
        emails: 1,
        profile: 1
      }
    });
  }

  Context.prototype.userId = function() {
    return this._frContext.userId;
  }

  Context.prototype.loggingIn = function() {
    return false;
  }

  // Redirect to a new page!  Because we are on a server page, we will serve
  // a 307 redirect message.
  //
  // Usage:
  // RouteCore.route('/place', function() {
  //   return this.redirect('/');
  // });
  Context.prototype.redirect = function(url) {
    var body = '<p>Temporarially Moved. Redirecting to <a href="' + url + '">' + url + '</a></p>';
    this.response.setHeader('Content-Type', 'text/html');
    this.response.statusCode = 307;
    this.response.setHeader('Location', url);
    this.response.end(body);
  }

  return Context;
})();

function callOnContext(fn) {
  // Returns a function which is equivalent to calling the function
  // fn on the current RouteCore context.  
  //
  // Throws an error if not in a RouteCore fiber

  return function() {
    try {
      var context = Fiber.current._routeCoreContext;
      return context[fn].apply(context, arguments);
    } catch (err) {
      throw new Error("Can only call " + fn + " when in a RouteCore Fiber.");
    }
  }
}

function bindGlobals() {
  // Binds a set of global values on the server
  //
  // Binds the following:
  // Meteor.subscribe()
  // Meteor.user()
  // Meteor.userId()
  // Meteor.loggingIn()
  // Session.get()
  // Session.set()
  // Session.equals()
  // Session.setDefault()

  global.Meteor = global.Meteor || {};
  global.Session = global.Session || {};

  global.Meteor.subscribe = callOnContext('subscribe');
  global.Meteor.user = callOnContext('user');
  global.Meteor.userId = callOnContext('userId');
  global.Meteor.loggingIn = callOnContext('loggingIn');

  global.Session.get = callOnContext('get');
  global.Session.set = callOnContext('set');
  global.Session.equals = callOnContext('equals');
  global.Session.setDefault = callOnContext('setDefault');
}

RouteCore._Context = Context;
RouteCore.bindGlobals = bindGlobals;

