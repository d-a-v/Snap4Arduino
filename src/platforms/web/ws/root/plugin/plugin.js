var extensionId = 'meajklokhjoflbimamdbhpdjlondmgpi',
    postal = new Postal(),
    firmata = {
        Board: function(port, callback) {
            if (port.substr(0, 5) == 'ws://')
                WebsocketConnect(port, callback);
            else
                chrome.runtime.sendMessage(extensionId, { command: 'connectBoard', args: [ port ] }, callback)
        }
    },
    require = function () {};

// Messaging between web client and plugin

function Postal() {};

// Command sender function factory
Postal.prototype.commandSender = function () {
    var myself = this,
        command = arguments[0],
        args = Array.from(arguments).slice(1),
        callback = typeof args[args.length - 1] === 'function' ? args.splice(args.length - 1) : null;

    return function () { myself.sendCommand(command, args, callback); };
};

Postal.prototype.sendCommand = function (command, args, callback) {
    console.log(command);
    console.log(args);
    console.log(callback);
    chrome.runtime.sendMessage(extensionId, { command: command, args: args }, callback);
};

chrome.serial = {
    getDevices: function (callback) { postal.sendCommand('getDevices', null, callback) }
};

function firmataReceived(a)
{
    m = "Unhandled from firmata: len=" + a.byteLength + ": "
    for (var i = 0; i < a.byteLength; i++)
    m += ' 0x' + a[i].toString(16);
        console.log(m);
}

function WebsocketConnect(port, callback)
{
    console.log('connecting to: ' + port);
    ws = new WebSocket(port);
    if (!ws)
    {
        alert("Cannot connect to WebSocket server '" + port + '"');
        return;
    }

    ws.onopen = function()
    {
        console.log('WS: connected to server\n');
        // firmata-websocket makes a difference between command and text, if that matters
        ws.send("hello from ws");

        console.log('ws: connect: calling CB');
        callback(port);
        console.log('ws: connect: CB called');
    };

    ws.onmessage = async function(evt)
    {
        var len = evt.data.length;
        console.log('WS: recv: type=' + typeof(evt.data));
        if (typeof(evt.data) == 'string') // (?? "evt.data instanceof String" does not work)
        {
            console.log('WS: receive text event len=' + evt.data.length + ': "' + evt.data + '"\n');
        }
        else if (evt.data instanceof Blob)
        {
            firmataReceived(new Uint8Array(await evt.data.arrayBuffer()));
        }
        else
        {
            console.log('receive unknown event ? (type=' + typeof(evt.data) + ')');
        }
        //ws.send(evt.data); // echo
    };

    ws.onclose = function()
    {
        console.log('ws closed\n');
        ws = undefined;
    };

    ws.onerror = function()
    {
        alert('No connection to ' + document.getElementById('hostname').value);
    }
}
