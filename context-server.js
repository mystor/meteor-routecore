Context = (function() {
  // On the server, we want to record subscribe events using
  // FastRender.  Thus, we extend the context from the
  // FastRender Context object.
  var __super__ = FastRender._Context.prototype;
  Context.prototype = Object.create(__super__);

  function Context() {
    this._sessionData = {};
    return FastRender._Context.apply(this, arguments);
  }

  // The subscribe function on the client returns an object with a
  // ready() and stop() method.  As we want to share code between
  // the client and the server, we need to make the subscribe function
  // return a object with these methods.
  Context.prototype.subscribe = function() {
    __super__.subscribe.apply(this, arguments);

    // The subsribe
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
  Context.prototype.sset = function(k, v) {
    this._sessionData[k] = v;
  }

  Context.prototype.sequals = function(k, v) {
    return this._sessionData[k] === v;
  }

  Context.prototype.sget = function(k) {
    return this._sessionData[k];
  }

  Context.prototype.ssetDefault = function(k, v) {
    if (!this._sessionData[k])
      this._sessionData[k] = v;
  }

  return Context;
})();

RouteCore._Context = Context;

