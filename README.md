# RouteCore
> RouteCore is a [Meteor](http://meteor.com) plugin which builds upon a series of other projects, including [page.js](http://visionmedia.github.io/page.js/), [connect-route](https://github.com/baryshev/connect-route), [fast-render](http://meteorhacks.com/fast-render/), and [react](http://facebook.github.io/react/). RouteCore extends Meteor, adding server-side rendering using the react library, and client/server routing.

With RouteCore, you share your rendering code across the client and the server, meaning that you can have fast page load times, and your pages are avaliable to search engines for indexing.

## Installation
RouteCore is on [atmosphere](https://atmosphere.meteor.com/package/routecore).

You can install it using [meteorite](http://oortcloud.github.io/meteorite/).
```bash
mrt add routecore
```

## Examples
* TodoMVC ([link](http://todomvc-routecore.meteor.com/)) ([source](https://github.com/mystor/todomvc/tree/routecore/labs/architecture-examples/meteor-routecore))
* Github Release Watch ([link](http://gh-release-watch.com)) ([source](https://github.com/mystor/gh-release-watch))

## The Page Context
On the client, values such as the session are stored in the global scope, as the entire scope for the code is one user. However, on the server we cannot use the global scope. Multiple clients can be interacting with the same server, and they need to have distinct sessions, userIds, etc. during their page's server-side rendering.

However, we want to enable people to use the same code that they would use on the client on the server, thus, we have the the Page Context.

On the server, these global state values, such as `Session`, `Meteor.user`, etc. are stored within the Page Context. There is a unique page context for every request to the server. For API consistency, this context is also avaliable on the client, however it simply defers to built-in Meteor calls.

In a function route, the page context is bound to `this`. If you are elsewhere in the route, you can get the page context by calling `RouteCore.context()`.

> *NOTE* RouteCore does not send the session values which are generated on the server to the client. When the client renders code for the first time, it is expected that it will generate identical session values.

> *NOTE* On the server, the current fiber is used to store the page context. If code creates a new fiber or runs code in a new fiber, it will not have access to the page context.

### Methods
The page context has the following methods:

```javascript
ctx.subscribe(args...) // Meteor.subscribe()
ctx.user()             // Meteor.user()
ctx.userId()           // Meteor.userId()
ctx.loggingIn()        // Meteor.loggingIn()

ctx.set(k, v)          // Session.set()
ctx.get(k)             // Session.get()
ctx.setDefault(k, v)   // Session.setDefault()
ctx.equals(k1, k2)     // Session.equals()

ctx.redirect()         // Redirect to a different URL
```

### Global Binding
It is possible to get RouteCore to bind these context values to the global scope. As this could potentially have negative side-effects, it is not this way by default.  If you call `RouteCore.bindGlobals()`, RouteCore will define the following global functions on the server:

```javascript
Meteor.subscribe();
Meteor.user();
Meteor.userId();
Meteor.loggingIn();

Session.get(k);
Session.set(k, v);
Session.setDefault(k, v);
Session.equals(k1, k2);
```

These functions only work on the server when in a RouteCore route, and will not work in other parts of Meteor code.

> *NOTE* It is completely safe to call `RouteCore.bindGlobals()` on the client. It is currently a no-op.

## Usage

### JSX
RouteCore contains the jsx transformer from `react-tools`, and will transform any .jsx files with it. The jsx transformer will not perform any transformations unless the comment `/** @jsx React.DOM */` is placed at the top of the file.

### Defining Routes
Routes are defined within a `RouteCore.map` block. To define a route, call `this.route`.

`this.route` takes 2 arguments:
1. A path spec. RouteCore uses page.js and connect-route for routing, and they use express-style path specs. (example: `/static/:required/:optional?`)

2. One of the following:
    1. A function: The return value of this function should be an initialized react component which will be rendered by React. This function will be passed one object (the request context - has `url` and `params` properties). The page context is bound to `this` within the function.
    2. A React component: The params passed to the component will be the path segments from the URL.

`this.route()` returns a function, which when called returns the path for the route.

#### Example
```javascript
/** @jsx React.DOM */

HomePage = React.createClass({ ... });
FriendsPage = React.createClass({ ... });

RouteCore.map(function() {
  var home = this.route('/', HomePage);
  var friends = this.route('/:user/friends', FriendsPage);

  var user = this.route('/:user', function(ctx) {
    return (
      <div>
        <a href={home()}>Home</a>
        <br />
        <a href={friends(ctx.params.user)}>See Friends</a>
      </div>
    );
  });
});
```

### Reactivity
On the client, the `render` method of a component is run within a reactive computation.  Whenever that computation is invalidated, the component will be re-rendered.

This is done by wrapping React.createClass(), and react components made through another mechanism may not act reactively.

### Programmatically Changing Pages
If you want to change the current page in response to a javascript event (such as a button press), you have a few options.  The function returned by `this.route()` has a method: `go`. Calling `go` and passing the same arguments that you would to the function returned by `this.route()` will redirect you to that page. 

If you want to redirect to a specific URL, you can also call `RouteCore.go(url)`.

#### Example
```javascript
/** @jsx React.DOM */

ProjectPage = React.createClass({ ... }); 

NewProjectButton = React.createClass({
  newProject: function(e) {
    var project = ...;

    // Either of the following would work:
    Routes.project.go(project);
    // or
    RouteCore.go(Routes.project(project));
  },

  render: function() {
    return (<button onClick={this.newProject}>New Project!</button>);
  }
});

Routes = {};

RouteCore.map(function() {
  Routes.project = this.route('/projects/:project', ProjectPage);
});
```

### Redirecting
Sometimes, you want to redirect the user to a different page.  To do this simply call `redirect(target_url)` on the current page context.  If you do this on the server, it will respond to the client with a `307` status code.  On the client, page.js will be used to send the user to a different page.

#### Example
```javascript
RouteCore.map(function() {
  var home = this.route('/', HomePage);

  this.route('/oldHome', function() {
    this.redirect(home());
  });
});
```

### Custom Server Side Responses
Sometimes you want to respond with your own data on the server.  On the server, the page context has two properties: `request` and `response`.  These are the node HTTP request and response objects.  You can call functions on them to directly send data to the client.

RouteCore will recognise if you call `response.end()`, and will not try to send any further data.

#### Example
```javascript
RouteCore.map(function() {
  if (Meteor.isServer) {
    this.route('/resource', function() {
      this.response.setHeader('Content-Type', 'application/json');
      this.response.end(JSON.stringify({
        data: 'WOO'
      }));
    });
  }
});
```

### Blaze Rendering Integration
There are some really awesome components (such as `{{> loginButtons}}`) which have been made for Meteor's Blaze rendering engine, which are not compatible with React and server side rendering.

RouteCore contains a simple component to allow you to use these components.

Calling `RouteCore.BlazeComponent(component)` creates a React component which, on the client, will contain the blaze component.  A string can also be passed as the `component` argument.  If this is the case, the template with that name will be used.

> *NOTE* The released version of Meteor still only bundles Spark, Meteor's old rendering engine. The integration does not support Spark, and requires at least `blaze-rc0`.  To upgrade your project to `blaze-rc0`, run `meteor update --release blaze-rc0`.

#### Example
template.html
```handlebars
<template name="integration">
  <p>I got this value from react: {{value}}</p>

  {{> loginButtons}}
</template>
```

component.jsx
```javascript
/** @jsx React.DOM */

var Integration = RouteCore.BlazeComponent('integration');

var OtherComponent = React.createClass({
  render: function() {
    return <Integration value='Sending data!' />
  }
}):
```

## License

(The MIT License)

Copyright (c) 2013 Michael Layzell

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

