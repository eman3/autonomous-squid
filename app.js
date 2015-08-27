hookshot = require("hookshot");
hookshot('refs/heads/master', 'pkill node node_modules/craftyjs/app.js && npm install && node node_modules/craftyjs/app.js').listen(3000);
