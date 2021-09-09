// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const BoardUtils = await hre.ethers.getContractFactory("BoardUtils");
  const boardUtils = await BoardUtils.deploy();
  await boardUtils.deployed();

  console.log("BoardUtils deployed to:", boardUtils.address);

  const TicTacToe = await hre.ethers.getContractFactory("TicTacToe", {
    libraries: {
      BoardUtils: boardUtils.address
    }
  });
  const ticTacToe = await TicTacToe.deploy();
  await ticTacToe.deployed();

  console.log("TicTacToe deployed to:", ticTacToe.address);

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(1, 1, ticTacToe.address);
  await factory.deployed();

  console.log("Factory deployed to:", factory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
