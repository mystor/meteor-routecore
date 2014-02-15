var reactTools = Npm.require('react-tools');

Plugin.registerSourceHandler('jsx', function(compileStep) {
  var src = compileStep.read().toString('utf8');
  var outputFile = compileStep.inputPath + '.js';

  compileStep.addJavaScript({
    path: outputFile,
    sourcePath: compileStep.inputPath,
    data: reactTools.transform(src)
  });
});

