// grab our hookshot
var hookshot = require('hookshot');
var shell = require('shelljs');
var config = require('./config/run');
shell.config.fatal = true;

// you need git
if (!shell.which('git')) {
  echo('Sorry, this script requires git');
  shell.exit(1);
}

if(config.run == false) {
  shell.exec("git clone https://github.com/mhsjlw/craftyjs.git server && cd server && npm install");
  config.run = true;
}

// make sure everything is up to date!
console.log("Updating...");
if(shell.exec('git pull && npm install && cd server && git pull && npm install && cd ..', { silent: false }).output != 0) {
  console.log("Wha!? Something went wrong... create an issue on GitHub with the output.");
  shell.exit(1);
}

var server = shell.exec('node server/app.js', { async: true, silent: true });
server.stdout.on('data', function(data) {
  console.log(data);
});

hookshot('refs/heads/master', function(info) {
  console.log("Hookshot fired! There was just an update! Downloading...");
  shell.exec("kill `ps -ef | awk '$8==\"node\" && $9==\"server/app.js\" {print $2}'`");
  console.log("Server killed, updating...");
  shell.exec('cd server && git pull && npm install && cd ..');
  console.log("Server updated! Starting server...");
  server = shell.exec('node server/app.js');
}).listen(3000);