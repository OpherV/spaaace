'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');
const FAKE_LAG = process.env.FAKE_LAG || 0;

// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

if (FAKE_LAG) {
  const origOn = io.on.bind(io);
  io.on = function(ev, cb) {
    return origOn(ev, function(socket) {
      const oldOn = socket.on.bind(socket);
      socket.on = function(ev, cb) {
        return oldOn(ev, function(...args) {
          setTimeout(() => cb(...args), FAKE_LAG);
        });
      };
      return cb(socket);
    });
  }
}

// Game Server
import MyServerEngine from './src/server/SpaaaceServerEngine.js';
import MyGameEngine from './src/common/SpaaaceGameEngine.js';


// Game Instances
const gameEngine = new MyGameEngine({ traceLevel: 1000 });
const serverEngine = new MyServerEngine(io, gameEngine, {
    debug: {},
    updateRate: 6,
    timeoutInterval: 0 // no timeout
});

// start the game
serverEngine.start();
