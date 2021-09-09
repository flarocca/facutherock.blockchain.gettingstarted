const BoardUtils = artifacts.require("../contracts/TicTacToe/Libraries/BoardUtils.sol");
const TicTacToe = artifacts.require("../contracts/TicTacToe/TicTacToe.sol");
const Factory = artifacts.require("../contracts/TicTacToe/Factory.sol");

module.exports = async (deployer, network, accounts) => {
    const options = {
        from: accounts[0]
    }

    await deployer.deploy(BoardUtils, options);
    await deployer.link(BoardUtils, Factory);
    await deployer.link(BoardUtils, TicTacToe);
    await deployer.deploy(TicTacToe);
    await deployer.deploy(Factory, 1, 1, TicTacToe.address, options);
};
