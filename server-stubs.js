/*
 * This file contains stub functions for reactive
 * objects normally avaliable only in client-side
 * Meteor.  This is to make it easier to share code
 * between the client and the server in routing
 */

Meteor.subscribe = function() {
  return {
    ready: function() { return true; },
    stop: function() {}
  }
};

// TODO: Come up with a sutible Session replacement

