'use strict';

module.exports = function(req, res){
    return {
        send: ok,
        fail: fail
    };

    function ok(obj) {
        res.send({ isSuccess: true, transactionId : res.transactionId, result: obj });   // cloud code
    }

    function fail(obj, code) {
        res.send({ isSuccess: false, transactionId : res.transactionId, errorCode: code || 450, errorMessage: JSON.stringify(obj) });
    }
};
