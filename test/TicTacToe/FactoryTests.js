const expect = require("chai").expect;

const Factory = artifacts.require("Factory");
const TicTacToe = artifacts.require("TicTacToe");
  
contract("Factory - JS", async accounts => {
    const FactoryStates = {
        AcceptingPlayerOne: 0,
        AcceptingPlayerTwo: 1,
        ReadyToStart: 2,
        OnGoing: 3,
        Finished: 4,
        Paid: 5
    }
    const [owner, alice, bob, frank] = accounts;
    const from = {
        from: owner
    }
    const validBet = 50;
    let contract;
    let game;

    beforeEach(async () => {
        game = await TicTacToe.new(from);
        contract = await Factory.new(1, validBet, game.address, from);

        await game.setFactory(contract.address, from);
    });

    it("Cannot instantiate if game address is invalid", async () => {
        // Arrange
        const emptyAddress = "0x0000000000000000000000000000000000000000";

        try {
            // Act
            await Factory.new(1, 1, emptyAddress, from);
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Game address is required");
        }
    });

    it("Can be instantiated", async () => {
        // Arrange
        const initialFee = 5;
        const initialBet = 2;

        // Act
        const contract = await Factory.new(initialFee, initialBet, TicTacToe.address, from);

        // Assert
        const currentState = await contract.state();
        expect(currentState.toNumber()).to.equal(FactoryStates.AcceptingPlayerOne);
    });

    it("Cannot create new game if value sent is not equal to valid bet", async () => {
        // Arrange
        const valueToSend = validBet - 1;

        try {
            // Act
            await contract.create(validBet, {from: alice, value: valueToSend});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ether sent does not match the bet required");
        }
    });

    it("Cannot create new game if bet sent is not equal to valid bet", async () => {
        // Arrange
        const betToSend = validBet - 1;

        try {
            // Act
            await contract.create(betToSend, {from: alice, value: validBet});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ether sent does not match the bet required");
        }
    });

    it("Can create a new game", async () => {
        // Arrange
        const playerOne = alice;

        // Act
        await contract.create(validBet, {from: playerOne, value: validBet});

        // Assert
        const currentPlayerOne = await contract.playerOne();
        const currentState = await contract.state();

        expect(currentPlayerOne).to.equal(playerOne);
        expect(currentState.toNumber()).to.equal(FactoryStates.AcceptingPlayerTwo);
    });

    it("Cannot create new game if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});

        try {
            // Act
            await contract.create(validBet, {from: alice, value: validBet});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });

    it("Cannot join a game if value sent is not equal to valid bet", async () => {
        // Arrange
        const valueToSend = validBet - 1;
        await contract.create(validBet, {from: alice, value: validBet});

        try {
            // Act
            await contract.join(validBet, {from: bob, value: valueToSend});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ether sent does not match the bet required");
        }
    });

    it("Cannot join game if bet sent is not equal to valid bet", async () => {
        // Arrange
        const betToSend = validBet - 1;
        await contract.create(validBet, {from: alice, value: validBet});

        try {
            // Act
            await contract.join(betToSend, {from: bob, value: validBet});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ether sent does not match the bet required");
        }
    });

    it("Cannot join game if player is already playing", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});

        try {
            // Act
            await contract.join(validBet, {from: alice, value: validBet});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("You are already playing this game");
        }
    });

    it("Cannot join game if state differs from AcceptingPlayerTwo", async () => {
        try {
            // Act
            await contract.join(validBet, {from: alice, value: validBet});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });

    it("Can join existing game", async () => {
        // Arrange
        const playerTwo = bob;
        await contract.create(validBet, {from: alice, value: validBet});

        // Act
        await contract.join(validBet, {from: playerTwo, value: validBet});

        // Assert
        const currentPlayerTwo = await contract.playerTwo();
        const currentState = await contract.state();

        expect(currentPlayerTwo).to.equal(playerTwo);
        expect(currentState.toNumber()).to.equal(FactoryStates.ReadyToStart);
    });

    it("Cannot start game if state differs from ReadyToStart", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});

        try {
            // Act
            await contract.start({from: frank});
        } catch(error) {
            //Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });

    it("Cannot start game if sender is not playing", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});

        try {
            // Act
            await contract.start({from: frank});
        } catch(error) {
            //Assert
            expect(error.reason).to.equal("You are not playig this game");
        }
    });

    it("Player one can start new game", async () => {
        // Arrange
        const playerOne = alice;
        await contract.create(validBet, {from: playerOne, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});

        // Act
        await contract.start({from: playerOne});

        // Assert
        const currentState = await contract.state();

        expect(currentState.toNumber()).to.equal(FactoryStates.OnGoing);
    });

    it("Player two can start new game", async () => {
        // Arrange
        const playerTwo = bob;
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: playerTwo, value: validBet});

        // Act
        await contract.start({from: playerTwo});

        // Assert
        const currentState = await contract.state();

        expect(currentState.toNumber()).to.equal(FactoryStates.OnGoing);
    });

    it("Cannot finish game if state differs from OnGoing", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});

        try {

            // Act
            await contract.finish(alice, {from: alice});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });

    it("Cannot finish game if sender differs from current game", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});
        await contract.start({from: alice});

        try {

            // Act
            await contract.finish(alice, {from: alice});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Only the current game can call this function");
        }
    });

    it("Cannot finish game if winner is not a player", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});
        await contract.start({from: alice});

        try {
            // Act
            await contract.finish(frank, {from: game.address});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Winner is not playig this game");
        }
    });

    it("Game can be finished", async () => {
        // Arrange
        await contract.create(validBet, {from: alice, value: validBet});
        await contract.join(validBet, {from: bob, value: validBet});
        await contract.start({from: alice});

        // Act
        await contract.finish(alice, {from: game.address});
        
        // Assert
        const currentState = await contract.state();
        const winner = await contract.winner();

        expect(currentState.toNumber()).to.equal(FactoryStates.Finished);
        expect(winner).to.equal(alice);
    });
});