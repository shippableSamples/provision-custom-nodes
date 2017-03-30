var self = ShippableAdapter;
module.exports = self;

var async = require('async');
var util = require('util');
var request = require('request');

function ShippableAdapter(token, apiUrl) {
  console.log(util.format('Initializing %s with token: %s', self.name, token));

  this.token = token;
  this.baseUrl = apiUrl;
}


ShippableAdapter.prototype.get = function (relativeUrl, callback) {
  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'apiToken ' + this.token
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl
  };

  async.series([
      _performCall.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.body, bag.res);
    }
  );
};

ShippableAdapter.prototype.post = function (relativeUrl, json, callback) {
  var opts = {
    method: 'POST',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'apiToken ' + this.token
    },
    json: json
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

// common helper methods
function _performCall(bag, next) {
  request(bag.opts,
    function (err, res, body) {
      bag.res = res;
      bag.body = body;
      bag.statusCode = res && res.statusCode;
      if (res && res.statusCode > 299) err = err || res.statusCode;
      if (err) {
        console.log('Shippable returned status', err,
          'for request', bag.relativeUrl);
        bag.err = err;
      }
      return next();
    }
  );
}

function _parseResponse(bag, next) {
  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
      if (bag.err && bag.parsedBody && bag.parsedBody.id)
        bag.err = bag.parsedBody;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
        if (bag.err && bag.parsedBody && bag.parsedBody.id)
          bag.err = bag.parsedBody;
      } catch (e) {
        if (!bag.err)
          console.log('Unable to parse bag.body', bag.body, e);
        bag.err = bag.err || {
          message: 'Could not parse response'
        };
      }
    }
  }

  if (bag.err)
    bag.err.statusCode = bag.statusCode;

  return next();
}

ShippableAdapter.prototype.getNodeInitScript =
  function (clusterNodeId, callback) {
    var url = '/clusterNodes/' + clusterNodeId + '/initScript';
    this.get(url, callback);
  };

ShippableAdapter.prototype.postClusterNode =
  function (json, callback) {
    var url = '/clusterNodes';
    this.post(url, json, callback);
  };
