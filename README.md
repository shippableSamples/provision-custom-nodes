## provision custom nodes

Please follow these steps to provision a custom node-

1. clone this project
2. update `config.json` to have correct values.

    a. `SHIPPABLE_API_TOKEN` is your apiToken.

    b. `FRIENDLY_NAME` is the name of your clusterNode.

    c. `IS_SHIPPABLE_INITIALIZED` should be set to `false`, if you want to run the node initialization script yourself. If it is set to `true` shippable will run the script for you, but before provisioning the node you have to run the command on your node to create a shippable user and ssh authorization(This command is available in your subscriptions/settings/nodes, click on `add node` and copy the command).

    d. `NODE_LOCATION` is the IP of your node.

    e. `SUBSCRIPTION_ID` is the `id` of subscription for which you want to add this node.

    f. `NODE_INIT_SCRIPT` is the name of script file. It contains the name of OS and docker version. You can check all the supported OS and docker versions [here](https://github.com/Shippable/node/tree/master/scripts). An example value is `Ubuntu_16.04_Docker_1.13.sh`.
3. Install node packages: `sudo npm install`
4. To provision custom node run ` node createCustomNode.js`. After this completes, node initialization script will be saved in `initScript.sh`. You can run it on your machine to use it as a Shippable node.
