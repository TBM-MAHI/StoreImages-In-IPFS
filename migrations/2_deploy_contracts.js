const imgContract = artifacts.require("storeHash");

module.exports = function(deployer) {
  deployer.deploy(imgContract);
};
