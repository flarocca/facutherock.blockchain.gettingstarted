const { expect } = require("chai");
const { ethers } = require("hardhat");
  
describe("Factory", () => {
    const FactoryStates = {
        AcceptingPlayerOne: 0,
        AcceptingPlayerTwo: 1,
        ReadyToStart: 2,
        OnGoing: 3,
        Finished: 4,
        Paid: 5
    }
    const validBet = 50;
    let [alice, bob, frank] = ["", "", "", ""];
    let TicTacToe;
    let ticTacToe;
    let Factory;
    let contract;

    beforeEach(async () => {
        [owner, alice, bob, frank]  = await ethers.getSigners();

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
        contract = await Factory.deploy(1, validBet, ticTacToe.address);

        await ticTacToe.setFactory(contract.address);
    });

    it("Cannot instantiate if game address is invalid", async () => {
        // Arrange
        const emptyAddress = "0x0000000000000000000000000000000000000000";

        // Act & Assert
        await expect(
            Factory.deploy(1, 1, emptyAddress)
          ).to.be.revertedWith("Game address is required");
    });

    it("Can be instantiated", async () => {
        // Arrange
        const initialFee = 5;
        const initialBet = 2;

        // Act
        const contract = await Factory.deploy(initialFee, initialBet, ticTacToe.address);

        // Assert
        const currentState = await contract.state();
        expect(currentState).to.equal(FactoryStates.AcceptingPlayerOne);
    });

    it("Cannot create new game if value sent is not equal to valid bet", async () => {
        // Arrange
        const valueToSend = validBet - 1;

        // Act & Assert
        await expect(
            contract.connect(alice).create(validBet, {value: valueToSend})
          ).to.be.revertedWith("Ether sent does not match the bet required");
    });

    it("Cannot create new game if bet sent is not equal to valid bet", async () => {
        // Arrange
        const betToSend = validBet - 1;

        // Act & Assert
        await expect(
            contract.connect(alice).create(betToSend, {value: validBet})
          ).to.be.revertedWith("Ether sent does not match the bet required");
    });

    it("Can create a new game", async () => {
        // Arrange
        const playerOne = alice;

        // Act
        await contract.connect(playerOne).create(validBet, {value: validBet});

        // Assert
        const currentPlayerOne = await contract.playerOne();
        const currentState = await contract.state();

        expect(currentPlayerOne).to.equal(playerOne.address);
        expect(currentState).to.equal(FactoryStates.AcceptingPlayerTwo);
    });

    it("Cannot create new game if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(alice).create(validBet, {value: validBet})
          ).to.be.revertedWith("This action cannot be executed at this state");
    });

    it("Cannot join a game if value sent is not equal to valid bet", async () => {
        // Arrange
        const valueToSend = validBet - 1;
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(bob).join(validBet, {value: valueToSend})
            ).to.be.revertedWith("Ether sent does not match the bet required");
    });

    it("Cannot join game if bet sent is not equal to valid bet", async () => {
        // Arrange
        const betToSend = validBet - 1;
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(bob).join(betToSend, {value: validBet})
            ).to.be.revertedWith("Ether sent does not match the bet required");
    });

    it("Cannot join game if player is already playing", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(alice).join(validBet, {value: validBet})
            ).to.be.revertedWith("You are already playing this game");
    });

    it("Cannot join game if state differs from AcceptingPlayerTwo", async () => {
        // Act & Assert
        await expect(
            contract.connect(alice).join(validBet, {value: validBet})
            ).to.be.revertedWith("This action cannot be executed at this state");
    });

    it("Can join existing game", async () => {
        // Arrange
        const playerTwo = bob;
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act
        await contract.connect(playerTwo).join(validBet, {value: validBet});

        // Assert
        const currentPlayerTwo = await contract.playerTwo();
        const currentState = await contract.state();

        expect(currentPlayerTwo).to.equal(playerTwo.address);
        expect(currentState).to.equal(FactoryStates.ReadyToStart);
    });

    it("Cannot start game if state differs from ReadyToStart", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(frank).start()
            ).to.be.revertedWith("This action cannot be executed at this state");
    });

    it("Cannot start game if sender is not playing", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(frank).start()
            ).to.be.revertedWith("You are not playig this game");
    });

    it("Player one can start new game", async () => {
        // Arrange
        const playerOne = alice;
        await contract.connect(playerOne).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});

        // Act
        await contract.connect(playerOne).start();

        // Assert
        const currentState = await contract.state();

        expect(currentState).to.equal(FactoryStates.OnGoing);
    });

    it("Player two can start new game", async () => {
        // Arrange
        const playerTwo = bob;
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(playerTwo).join(validBet, {value: validBet});

        // Act
        await contract.connect(playerTwo).start();

        // Assert
        const currentState = await contract.state();

        expect(currentState).to.equal(FactoryStates.OnGoing);
    });

    it("Cannot finish game if state differs from OnGoing", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});

        // Act & Assert
        await expect(
            contract.connect(alice).finish(alice.address)
            ).to.be.revertedWith("This action cannot be executed at this state");
    });

    it("Cannot finish game if sender differs from current game", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});
        await contract.connect(alice).start();

        // Act & Assert
        await expect(
            contract.connect(alice).finish(alice.address)
            ).to.be.revertedWith("Only the current game can call this function");
    });

    it("Cannot finish game if winner is not a player", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});
        await contract.connect(alice).start();

        console.debug("ticTacToe: " + JSON.stringify(ticTacToe));

        // Act & Assert
        await expect(
            contract.connect(ticTacToe).finish(frank.address)
            ).to.be.revertedWith("Winner is not playig this game");
    });

    it("Game can be finished", async () => {
        // Arrange
        await contract.connect(alice).create(validBet, {value: validBet});
        await contract.connect(bob).join(validBet, {value: validBet});
        await contract.connect(alice).start();

        // Act
        await contract.connect(ticTacToe).finish(alice.address);
        
        // Assert
        const currentState = await contract.state();
        const winner = await contract.winner();

        expect(currentState).to.equal(FactoryStates.Finished);
        expect(winner).to.equal(alice.address);
    });
});