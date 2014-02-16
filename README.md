# RouteCore

RouteCore is a [Meteor](http://meteor.com) plugin which builds upon a series of other projects, including [page.js](http://visionmedia.github.io/page.js/), [connect-route](https://github.com/baryshev/connect-route), [fast-render](http://meteorhacks.com/fast-render/), and [react](http://facebook.github.io/react/). RouteCore extends Meteor, adding server-side rendering using the react library, and client/server routing.

With RouteCore, you share your rendering code across the client and the server, meaning that you can have fast page load times, and built in search engine capabilities.

## Installation

```bash
mrt add routecore
```

## Quick Start

```javascript
/** @jsx React.DOM */

Posts = new Meteor.Collection('posts');

var HomePage = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Hello {this.props.name}</h1>
        <ul>
          {this.props.posts.map(function(post) {
            return (
              <li key={post._id}>
                <h2><a href={Routes.post(post._id)}>{post.title}</a></h2>
                <p>{post.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
});

var Post = React.createClass({
  render: function() {
    return (
      <div>
        <h1>{this.props.post.title}</h1>
        <p>{this.props.post.body}</p>
      </div>
    )
  }
});

var LoadingPage = React.createClass({
  render: function() {
    return <h1>Loading...</h1>
  }
});

Routes = {};
RouteCore.map(function() {
  Routes.index = this.route('/', function() {
    var name;
    if (this.user())
      name = this.user().username;
    else
      name = 'Anonymous';

    if (this.subscribe('posts').ready())
      return <HomePage name={name} posts={Posts.find().fetch()} />
    else
      return <LoadingPage />
  });

  Routes.post = this.route('/post/:id', function(ctx) {
    var sub = this.subscribe('posts');

    if (sub.ready()) {
      return (
        <div>
          <a href={Routes.index()}>Back</a>
          <Post post={Posts.findOne({_id: ctx.params.id})} />
        </div>
      );
    } else
      return <LoadingPage />
  });
});

if (Meteor.isServer) {
  Posts.remove({});
  for (var i=0; i<10; i++) {
    Posts.insert({
      title: 'Post ' + i,
      body: 'Post Body for post #' + i
    });
  }

  Meteor.publish('posts', function() {
    return Posts.find();
  });
}
```

## API

All routing and react code should be run on both the client and the server.
RouteCore will compile the route on the server, and push an already completed
copy of the route to the client. In addition, with the help of Fast-Render,
RouteCore will push down the subscriptions which you subscribe to, in their
entirety.  Thus, your page will be ready to go immediately.

### Creating Routes
```javascript
RouteCore.map(function() {
  this.route('/path', function(ctx) {
    return <h1>Hello World!</h1>
  });
});
```

### Variable Path Segments
```javascript
RouteCore.map(function() {
  this.route('/pages/:page', function(ctx) {
    return <h1>Welcome to page: {ctx.params.page}</h1>
  });
});
```

### Reversing URLs
```javascript
var Routes = {};
RouteCore.map(function() {
  Routes.index = this.route('/', function(ctx) {
    return <a href={Routes.page('pageName')}>GO</a>
  });

  Routes.page = this.route('/pages/:page', function(ctx) {
    return <h1>Welcome to page: {ctx.params.page}</h1>
  });
});
```

### Redirecting
```javascript
var Routes = {};
RouteCore.map(function() {
  Routes.index = this.route('/', function(ctx) {
    this.redirect(Routes.about());
  });

  Routes.about = this.route('/about', function(ctx) {
    return <h1>About Page</h1>
  });
});
```

### Subscriptions
```javascript
RouteCore.map(function() {
  this.route('/', function(ctx) {
    if (this.subscribe('posts').ready()) {
      var posts = Posts.find().fetch();

      return (
        <div>
          {posts.map(function(post) {
            return <p>{post.title}</p>
          })}
        </div>
      );
    } else {
      return <h1>Loading...</h1>
    }
  });
});
```

### Session
```javascript
RouteCore.map(function() {
  this.route('/', function(ctx) {
    this.ssetDefault('name', 'Jim');
    return <h1>Hello {this.sget('name')}</h1>
  });
});
```

### Users
```javascript
RouteCore.map(function() {
  this.route('/', function(ctx) {
    var name;
    if (this.user())
      name = this.user().username;
    else
      name = 'Anonymous';

    return <h1>Welcome {name}</h1>
  });
});
```

## JSX

Files with the extension `.jsx` will be compiled with `react-tools`. The examples above all use `.jsx` to make React easier to use.

## Contributing

If you have any ideas on how to improve the project, or any bug fixes or corrections to make, please fork and make a pull request. I am always open to new improvements.

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

