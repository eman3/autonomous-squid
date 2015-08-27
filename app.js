var hookshot = require("hookshot");
var childProcess = require('child_process'), server;

server = childProcess.exec('node node_modules/craftyjs/app.js', function (error, stdout, stderr) {
  if (error) {
    console.log(error.stack);
    console.log('Error code: '+error.code);
    console.log('Signal received: '+error.signal);
  }
  console.log('Child Process STDOUT: '+stdout);
  console.log('Child Process STDERR: '+stderr);
});

server.on('exit', function (code) {
  console.log('Server process exited with exit code ' + code);
});

hookshot('refs/heads/master', 'pkill "node node_modules/craftyjs/app.js" ; npm install && node node_modules/craftyjs/app.js').listen(3000);
