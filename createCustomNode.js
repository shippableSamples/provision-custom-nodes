var async = require('async');
var fs = require('fs');
var util = require('util');

var ShippableAdapter = require('./ShippableAdapter.js');

function createClusterNode() {
  var bag = {
    apiUrl: "https://api.shippable.com"
  };

  async.series([
      _readConfigs.bind(null, bag),
      _postClusterNode.bind(null, bag),
      _getNodeInitScript.bind(null, bag),
      _saveInitScript.bind(null, bag)
    ],
    function (err) {
      if (err)
        console.log('Failed to post clusterNode with error: ', err);
      else {
        console.log('successfully created clusterNode');
      }
    }
  );
}

function _readConfigs(bag, next) {
  console.log('Reading config.json file');

  fs.readFile('config.json',
    function (err, data) {
      if (err)
        return next(err);

      data = data.toString();
      var error = null;
      // parse data
      try {
        bag.configs = JSON.parse(data);
      } catch (e) {
        error = 'Unable to parse config data. ' +
          'Please check if config.json is a valid JSON file.';
      }

      if (error)
        return next(error);
      else
        return next();
    }
  );
}

function _postClusterNode(bag, next) {
  console.log('creating clusterNode');

  bag.shippableAdapter = new ShippableAdapter(bag.configs.SHIPPABLE_API_TOKEN,
    bag.apiUrl);

  var clusterNodeBody = {
    friendlyName: bag.configs.FRIENDLY_NAME,
    isShippableInitialized: bag.configs.IS_SHIPPABLE_INITIALIZED,
    location: bag.configs.NODE_LOCATION,
    nodeTypeCode: bag.configs.NODE_TYPE_CODE,
    sshPort: bag.configs.SSH_PORT,
    nodeInitScript: bag.configs.NODE_INIT_SCRIPT,
    subscriptionId: bag.configs.SUBSCRIPTION_ID
  };

  bag.shippableAdapter.postClusterNode(clusterNodeBody,
    function (err, clusterNode) {
      if (err)
        return next(err);

      bag.clusterNode = clusterNode;
      return next();
    }
  );
}

function _getNodeInitScript(bag, next) {
  console.log('getting node initialization script');

  bag.shippableAdapter.getNodeInitScript(bag.clusterNode.id,
    function (err, initScript) {
      if (err)
        return next(err);

      bag.initScript = initScript;
      return next();
    }
  );
}

function _saveInitScript(bag, next) {
  console.log('saving initScript in initScript.sh');

  fs.writeFile('initScript.sh', bag.initScript,
    function (err) {
      if (err)
        return next(err);

      return next();
    }
  );
}

// call createClusterNode
createClusterNode();
