var mcServer = require("craftyjs");
var hookshot = require("hookshot");
hookshot('refs/heads/master', 'npm install').listen(3000);

var settings = require('./config/settings');

var options = {
  motd: settings.motd,
  'max-players': settings.maxPlayers,
  port: settings.port,
  'online-mode': settings.onlineMode,
  gameMode:settings.gameMode
};

mcServer.createMCServer(options);
