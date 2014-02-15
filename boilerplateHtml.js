var fs = Npm.require('fs');
var path = Npm.require('path');
var connect = Npm.require('connect');

boilerplateHtml = '';

// Generate the html
Meteor.startup(function() {
  var RELOAD_SAFETYBELT = "\n" +
        "if (typeof Package === 'undefined' || \n" +
        "    ! Package.webapp || \n" +
        "    ! Package.webapp.WebApp || \n" +
        "    ! Package.webapp.WebApp._isCssLoaded()) \n" +
        "  document.location.reload(); \n";

  var clientJsonPath = path.join(__meteor_bootstrap__.serverDir,
                                 __meteor_bootstrap__.configJson.client);
  var clientDir = path.dirname(clientJsonPath);
  var clientJson = JSON.parse(fs.readFileSync(clientJsonPath, 'utf8'));

  var boilerplateHtmlPath = path.join(clientDir, clientJson.page);
  boilerplateHtml = fs.readFileSync(boilerplateHtmlPath, 'utf8');

  if (WebAppInternals.inlineScriptsAllowed()) {
    boilerplateHtml = boilerplateHtml.replace(
        /##RUNTIME_CONFIG##/,
      "<script type='text/javascript'>__meteor_runtime_config__ = " +
        JSON.stringify(__meteor_runtime_config__) + ";</script>");
    boilerplateHtml = boilerplateHtml.replace(
        /##RELOAD_SAFETYBELT##/,
      "<script type='text/javascript'>"+RELOAD_SAFETYBELT+"</script>");
  } else {
    boilerplateHtml = boilerplateHtml.replace(
      /##RUNTIME_CONFIG##/,
      "<script type='text/javascript' src='##ROOT_URL_PATH_PREFIX##/meteor_runtime_config.js'></script>"
    );
    boilerplateHtml = boilerplateHtml.replace(
        /##RELOAD_SAFETYBELT##/,
      "<script type='text/javascript' src='##ROOT_URL_PATH_PREFIX##/meteor_reload_safetybelt.js'></script>");

  }
  boilerplateHtml = boilerplateHtml.replace(
      /##ROOT_URL_PATH_PREFIX##/g,
    __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "");

  var bundledJsCssPrefix = undefined;
  boilerplateHtml = boilerplateHtml.replace(
      /##BUNDLED_JS_CSS_PREFIX##/g,
    bundledJsCssPrefix ||
      __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "");

  // TODO: Make this actually useful
  boilerplateHtml = boilerplateHtml.replace('##HTML_ATTRIBUTES##', '');
});




