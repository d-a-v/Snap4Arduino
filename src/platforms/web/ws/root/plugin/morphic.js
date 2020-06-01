WorldMorph.prototype.Arduino.firmata = firmata;

WorldMorph.prototype.Arduino.getSerialPorts = function (callback) {
    var myself = this,
    portList = [],
    portcheck = /usb|DevB|rfcomm|acm|^com/i;

    if (typeof chrome !== 'undefined') {
        chrome.serial.getDevices(function (devices) {
            devices.forEach(function (device) {
                if (!myself.isPortLocked(device.path) && portcheck.test(device.path)) {
                    portList[device.path] = device.path;
                }
            });
        });
    }

    // it is possible to get a real list by scanning with mDNS/bonjour
    wsurl = 'ws://firmata.local:3031';
    portList['websocket: ' + wsurl] = wsurl;
    callback(portList);
};

// Reverting some changes
WorldMorph.prototype.init = WorldMorph.prototype.originalInit;
