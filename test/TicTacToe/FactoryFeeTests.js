const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FactoryFee", () => {
    let [owner, alice] = ["", ""];
    let TicTacToe;
    let ticTacToe;
    let Factory;
    let contract;

    beforeEach(async () => {
        [owner, alice] = await ethers.getSigners();

        const BoardUtils = await hre.ethers.getContractFactory("BoardUtils");
        const boardUtils = await BoardUtils.deploy();
        await boardUtils.deployed();

        TicTacToe = await ethers.getContractFactory("TicTacToe", {
          libraries: {
            BoardUtils: boardUtils.address
          }
        });
        ticTacToe = await TicTacToe.deploy();

        Factory = await ethers.getContractFactory("Factory");
        contract = await Factory.deploy(1, 1, ticTacToe.address);
    });

    it("Initial fee must be greater than 0", async () => {
        // Arrange
        const initialFeeLessThanOne = 0;

        // Act & Assert
        await expect(
          Factory.deploy(initialFeeLessThanOne, 1, ticTacToe.address)
        ).to.be.revertedWith("Initial Fee must be greater than zero.");
    });

    it("Initial bet must be greater than 0", async () => {
        // Arrange
        const initialBetLessThanOne = 0;

        // Act & Assert
        await expect(
          Factory.deploy(1, initialBetLessThanOne, ticTacToe.address)
        ).to.be.revertedWith("Initial Bet must be greater than zero.");
    });

    it("Can be instantiated", async () => {
        // Arrange
        const initialFee = 5;
        const initialBet = 2;

        // Act
        const contract = await Factory.deploy(initialFee, initialBet, ticTacToe.address);

        // Assert
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("Can get fee", async () => {
        // Arrange
        const initialFee = 5;
        const contract = await Factory.deploy(initialFee, 1, ticTacToe.address);

        // Act
        const fee = await contract.fee();

        // Assert
        expect(fee.toNumber()).to.equal(initialFee);
    });

    it("Can get bet", async () => {
        // Arrange
        const initialBet = 5;
        const contract = await Factory.deploy(1, initialBet, ticTacToe.address);

        // Act
        const bet = await contract.bet();

        // Assert
        expect(bet.toNumber()).to.equal(initialBet);
    });

    it("Only owner can update fee", async () => {
        // Arrange
        const notOwnerAddress = alice;

        // Act & Assert
        await expect(
          contract.connect(notOwnerAddress).updateFee(2)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Only owner can update bet", async () => {
        // Arrange
        const notOwnerAddress = alice;

        // Act & Assert
        await expect(
          contract.connect(notOwnerAddress).updateBet(2)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner can update fee", async () => {
        // Arrange
        const newFee = 5;

        // Act
        await contract.updateFee(newFee);

        // Assert
        const currentFee = await contract.fee();
        expect(currentFee.toNumber()).to.equal(newFee);
    });

    it("Owner can update bet", async () => {
        // Arrange
        const newBet = 5;

        // Act
        await contract.updateBet(newBet);

        // Assert
        const currentBet = await contract.bet();
        expect(currentBet.toNumber()).to.equal(newBet);
    });

    it("Cannot update fee if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        const contract = await Factory.deploy(1, 1, ticTacToe.address);
        await contract.connect(alice).create(1, {value: 1});

        // Act & Assert
        await expect(
          contract.updateFee(2)
        ).to.be.revertedWith("This action cannot be executed at this state");
    });

    it("Cannot update bet if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        const contract = await Factory.deploy(1, 1, ticTacToe.address);
        await contract.connect(alice).create(1, {value: 1});

        // Act & Assert
        await expect(
          contract.updateBet(2)
        ).to.be.revertedWith("This action cannot be executed at this state");
    });
});