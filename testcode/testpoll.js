var ping = require('ping');
var net = require('net');


var hosts = [
    {host:'ipaddrrrrrr', port: 111111111},
];

var previousStates = {};

function ifdead(host){
    ping.sys.probe(host, function(isAlive) {
        var msg= isAlive ? 'host: ' + host + ' server is alive' : 'host: ' + host + ' server dead' ;
        console.log(msg);
    })
}
function checkHosts(){
    hosts.forEach(function(target){
        var socket = new net.Socket();
        socket.setTimeout(3000);
    
        socket.on('connect', function() {
            var currentState = 'alive';
            if (previousStates[target.host] !== currentState) {
                console.log('host ' + target.host + ' on port ' + target.port + ' is alive');
                previousStates[target.host] = currentState;
            }
            socket.destroy(); // 接続を閉じる
        }).on('error', function() {
            var currentState = 'dead';
            if (previousStates[target.host] !== currentState) {
                console.log('host ' + target.host + ' on port ' + target.port + ' is dead (error)');
                previousStates[target.host] = currentState;
                ifdead(target.host);
            }
        }).on('timeout', function() {
            var currentState = 'dead';
            if (previousStates[target.host] !== currentState) {
                console.log('host ' + target.host + ' on port ' + target.port + ' is dead (timeout)');
                previousStates[target.host] = currentState;
                ifdead(target.host);
            }
            socket.destroy(); // タイムアウト時に接続を閉じる
            ifdead(target.host);
        }).connect(target.port, target.host);
    });
}

let interval = 10;
setInterval(checkHosts, interval * 1000);