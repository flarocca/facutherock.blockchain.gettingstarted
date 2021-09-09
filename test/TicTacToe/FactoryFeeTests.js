const expect = require("chai").expect;

const TicTacToe = artifacts.require("TicTacToe");
const Factory = artifacts.require("Factory");

contract("FactoryFee - JS", async accounts => {
    const [owner, alice] = accounts;
    const from = {
        from: owner
    };
    let contract;

    beforeEach(async () => {
        contract = await Factory.new(1, 1, TicTacToe.address, from);
    });

    it("Initial fee must be greater than 0", async () => {
        // Arrange
        const initialFeeLessThanOne = 0;

        try {
            // Act
            await Factory.new(initialFeeLessThanOne, 1, TicTacToe.address, from);
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Initial Fee must be greater than zero.");
        }
    });

    it("Initial bet must be greater than 0", async () => {
        // Arrange
        const initialBetLessThanOne = 0;

        try {
            // Act
            await Factory.new(1, initialBetLessThanOne, TicTacToe.address, from);
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Initial Bet must be greater than zero.");
        }
    });

    it("Can be instantiated", async () => {
        // Arrange
        const initialFee = 5;
        const initialBet = 2;

        // Act
        const contract = await Factory.new(initialFee, initialBet, TicTacToe.address, from);

        // Assert
        expect(await contract.owner()).to.equal(accounts[0]);
    });

    it("Can get fee", async () => {
        // Arrange
        const initialFee = 5;
        const contract = await Factory.new(initialFee, 1, TicTacToe.address, from);

        // Act
        const fee = await contract.fee();

        // Assert
        expect(fee.toNumber()).to.equal(initialFee);
    });

    it("Can get bet", async () => {
        // Arrange
        const initialBet = 5;
        const contract = await Factory.new(1, initialBet, TicTacToe.address, from);

        // Act
        const bet = await contract.bet();

        // Assert
        expect(bet.toNumber()).to.equal(initialBet);
    });

    it("Only owner can update fee", async () => {
        // Arrange
        const notOwnerAddress = accounts[1];

        try {
            // Act
            await contract.updateFee(2, {from: notOwnerAddress});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ownable: caller is not the owner");
        }
    });

    it("Only owner can update bet", async () => {
        // Arrange
        const notOwnerAddress = accounts[1];

        try {
            // Act
            await contract.updateBet(2, {from: notOwnerAddress});
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("Ownable: caller is not the owner");
        }
    });

    it("Owner can update fee", async () => {
        // Arrange
        const newFee = 5;

        // Act
        await contract.updateFee(newFee, from);

        // Assert
        const currentFee = await contract.fee();
        expect(currentFee.toNumber()).to.equal(newFee);
    });

    it("Owner can update bet", async () => {
        // Arrange
        const newBet = 5;

        // Act
        await contract.updateBet(newBet, from);

        // Assert
        const currentBet = await contract.bet();
        expect(currentBet.toNumber()).to.equal(newBet);
    });

    it("Cannot update fee if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        const contract = await Factory.new(1, 1, TicTacToe.address, from);
        await contract.create(1, {from: alice, value: 1});

        try {
            // Act
            await contract.updateFee(2, from);
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });

    it("Cannot update bet if status differs from AcceptingPlayerOne", async () => {
        // Arrange
        const contract = await Factory.new(1, 1, TicTacToe.address, from);
        await contract.create(1, {from: alice, value: 1});

        try {
            // Act
            await contract.updateBet(2, from);
        } catch(error) {
            // Assert
            expect(error.reason).to.equal("This action cannot be executed at this state");
        }
    });
});