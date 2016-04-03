module.exports = function(client, opts) {
    var connected = client.connected;
    var emit = client.emit.bind(client);
    var queue = [];

    opts = opts || {};
    var maxMessages = opts.maxMessages || 1000;

    if (typeof opts === 'number') {
        maxMessages = parseInt(opts);
    }

    var emptyQueue = function() {
        if (!queue.length) return;
        queue.forEach(function(args) {
            emit.apply(null, args);
        });
        queue = [];
    };
    
    var connectCallback = function() {
        connected = true;
        emptyQueue();
    };
    var disconnectCallback = function() {
        connected = false;
    };


    
    client.on('connect', connectCallback);
    client.on('reconnect', connectCallback);
    client.on('disconnect', disconnectCallback);

    client.send = function() {
        if (!connected) {
            if (queue.length >= maxMessages) {
                throw "Max queued messages (" + maxMessages + ") reached for client";
            }
            queue.push(Array.prototype.slice.call(arguments));
            return;
        }

        if (queue.length) {
            emptyQueue();
        }

        emit.apply(null, arguments);
    };

    client.queue = queue;
    
    return client;
};

