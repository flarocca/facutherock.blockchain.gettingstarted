// const hre = require("hardhat");
const { network, ethers } = require("hardhat");

async function main() {

  // const UniswapSwap = await hre.ethers.getContractFactory("UniswapSwap");
  // const uniswapSwap = await UniswapSwap.deploy();
  // await uniswapSwap.deployed();

  // console.log("UniswapSwap deployed to:", uniswapSwap.address);

  const daiHolder = "0xc4a4c240695d253cc4cc85cad07ff7003c93dd0d";

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xc4a4c240695d253cc4cc85cad07ff7003c93dd0d"],
  });

  const [alice] = await ethers.getSigners();
  // const signer = await ethers.getSigner("0xc4a4c240695d253cc4cc85cad07ff7003c93dd0d")
  // await alice.sendTransaction({
  //   to: daiHolder,
  //   value: ethers.utils.parseEther("10")
  // });

  await network.provider.send("hardhat_setBalance", [
    daiHolder,
    "0x1000",
  ]);

  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
