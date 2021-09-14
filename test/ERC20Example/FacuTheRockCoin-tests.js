const { expect } = require("chai");
const { ethers } = require("hardhat");
  
describe("FacuTheRockCoin", () => {

    const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
    const TOTAL_SUPPLY = 50;

    const toUnits = units => units * (10 ** 10);
    const addSevenDaysToBlockTimestamp = async () => {
        const sevenDays = 7 * 24 * 60 * 60;
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNumber);

        await ethers.provider.send('evm_setNextBlockTimestamp', [currentBlock.timestamp + sevenDays]); 
        await ethers.provider.send('evm_mine');
    }

    let [owner, alice, bob, frank] = ["", "", "", ""];
    let FacuTheRockCoin;
    let facuTheRockCoin;

    beforeEach(async () => {
        [owner, alice, bob, frank]  = await ethers.getSigners();

        FacuTheRockCoin = await ethers.getContractFactory("FacuTheRockCoin");
        facuTheRockCoin = await FacuTheRockCoin.connect(owner).deploy(TOTAL_SUPPLY);
    });

    it("Cannot instantiate if total supply is zero", async () => {
        // Act & Assert
        await expect(
            FacuTheRockCoin.deploy(0)
          ).to.be.revertedWith("INVALID_TOTAL_SUPPLY");
    });

    it("Can be instantiated", async () => {
        // Arrange
        const initialSupply = 100;
        const expectedInitialSupply = 1000000000000

        // Act
        const coin = await FacuTheRockCoin.connect(owner).deploy(initialSupply);

        // Assert
        const currentInitialSupply = await coin.totalSupply();
        const currentName = await coin.name();
        const cyrrentSymbol = await coin.symbol();
        const currentDecimals = await coin.decimals();
        const currentBalanceOfOwner = await coin.balanceOf(owner.address);

        expect(currentInitialSupply).to.equal(expectedInitialSupply);
        expect(currentName).to.equal('FacuTheRockCoin');
        expect(cyrrentSymbol).to.equal('FTR');
        expect(currentDecimals).to.equal(10);
        expect(currentBalanceOfOwner).to.equal(expectedInitialSupply);
    });

    it("Cannot transfer to address(0)", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transfer(EMPTY_ADDRESS, 10)
          ).to.be.revertedWith("EMPTY_ADDRESS_NOT_ALLOWED");
    });

    it("Cannot transfer zero amount", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transfer(alice.address, 0)
          ).to.be.revertedWith("INVALID_AMOUNT");
    });

    it("Cannot transfer if funds are not enough", async () => {
        // Arrange
        const amount = toUnits(TOTAL_SUPPLY * 2);

        // Act & Assert
        await expect(
            facuTheRockCoin.connect(owner).transfer(alice.address, amount)
          ).to.be.revertedWith("INSUFFICIENT_FUNDS");
    });

    it("Can transfer tokens", async () => {
        // Arrange
        const amount = toUnits(20);

        // Act
        await facuTheRockCoin.connect(owner).transfer(alice.address, amount);

        // Assert
        const ownerBalance = await facuTheRockCoin.balanceOf(owner.address);
        const aliceBalance = await facuTheRockCoin.balanceOf(alice.address);

        expect(ownerBalance).to.equal(toUnits(TOTAL_SUPPLY) - amount);
        expect(aliceBalance).to.equal(amount);
    });

    it("Transfer emits Transfer event", async () => {
        // Arrange
        const amount = toUnits(1);

        // Act & Assert
        await expect(facuTheRockCoin.connect(owner).transfer(alice.address, amount))
          .to.emit(facuTheRockCoin, 'Transfer')
          .withArgs(owner.address, alice.address, amount);
    });

    it("Approve increments allowance from sender to spender", async () => {
        // Arrange
        const amount = toUnits(20);
        const sender = alice;
        const spender = bob;

        // Act
        await facuTheRockCoin.connect(sender).approve(spender.address, amount);

        // Assert
        const senderAllowance = await facuTheRockCoin.allowance(sender.address, spender.address);

        expect(senderAllowance).to.equal(amount);
    });

    it("Approve increments allowance from sender to spender if there was already some allowance", async () => {
        // Arrange
        const amount = toUnits(20);
        const sender = alice;
        const spender = bob;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount);

        // Act
        await facuTheRockCoin.connect(sender).approve(spender.address, amount);

        // Assert
        const senderAllowance = await facuTheRockCoin.allowance(sender.address, spender.address);

        expect(senderAllowance).to.equal(amount * 2);
    });

    it("Approve emits Approval event", async () => {
        // Arrange
        const amount = toUnits(20);
        const sender = alice;
        const spender = bob;

        // Act & Assert
        await expect(facuTheRockCoin.connect(sender).approve(spender.address, amount))
          .to.emit(facuTheRockCoin, 'Approval')
          .withArgs(sender.address, spender.address, amount);
    });

    it("Cannot transferFrom if sender is address(0)", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transferFrom(EMPTY_ADDRESS, alice.address, 10)
          ).to.be.revertedWith("EMPTY_ADDRESS_NOT_ALLOWED");
    });

    it("Cannot transferFrom if recipient is address(0)", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transferFrom(alice.address, EMPTY_ADDRESS, 10)
          ).to.be.revertedWith("EMPTY_ADDRESS_NOT_ALLOWED");
    });

    it("Cannot transferFrom if amount is zero", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transferFrom(alice.address, bob.address, 0)
          ).to.be.revertedWith("INVALID_AMOUNT");
    });

    it("Cannot transferFrom if allowance for spender from sender is zero", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.transferFrom(alice.address, bob.address, 100)
          ).to.be.revertedWith("AMOUNT_EXCEEDS_ALLOWANCE");
    });

    it("Cannot transferFrom if allowance for spender from sender is less than amount", async () => {
        // Arrange
        const amount = toUnits(20);
        const sender = alice;
        const spender = bob;
        const recipient = frank;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount);
        
        // Act & Assert
        await expect(
            facuTheRockCoin.connect(spender).transferFrom(sender.address, recipient.address, amount * 2)
          ).to.be.revertedWith("AMOUNT_EXCEEDS_ALLOWANCE");
    });

    it("TransferFrom transfers balance from sender to recipient", async () => {
        // Arrange
        const amount = toUnits(20);
        const sender = owner;
        const spender = bob;
        const recipient = frank;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount);

        // Act
        facuTheRockCoin.connect(spender).transferFrom(sender.address, recipient.address, amount);
        
        // Assert
        const senderBalance = await facuTheRockCoin.balanceOf(sender.address);
        const recipientBalance = await facuTheRockCoin.balanceOf(recipient.address);

        expect(senderBalance).to.equal(toUnits(TOTAL_SUPPLY) - amount);
        expect(recipientBalance).to.equal(amount);
    });

    it("Can TransferFrom less than allowance", async () => {
        // Arrange
        const amount = toUnits(10);
        const sender = owner;
        const spender = bob;
        const recipient = frank;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount + 10);

        // Act
        facuTheRockCoin.connect(spender).transferFrom(sender.address, recipient.address, amount);
        
        // Assert
        const senderBalance = await facuTheRockCoin.balanceOf(sender.address);
        const recipientBalance = await facuTheRockCoin.balanceOf(recipient.address);

        expect(senderBalance).to.equal(toUnits(TOTAL_SUPPLY) - amount);
        expect(recipientBalance).to.equal(amount);
    });

    it("TransferFrom reduces allowance for spender from sender", async () => {
        // Arrange
        const amount = toUnits(10);
        const sender = owner;
        const spender = bob;
        const recipient = frank;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount + 10);

        // Act
        facuTheRockCoin.connect(spender).transferFrom(sender.address, recipient.address, amount);
        
        // Assert
        const spenderAllowance = await facuTheRockCoin.allowance(sender.address, spender.address);

        expect(spenderAllowance).to.equal(10);
    });

    it("TransferFrom emits Transfer event", async () => {
        // Arrange
        const amount = toUnits(10);
        const sender = owner;
        const spender = bob;
        const recipient = frank;
        await facuTheRockCoin.connect(sender).approve(spender.address, amount + 10);

        // Act & Assert
        await expect(facuTheRockCoin.connect(spender).transferFrom(sender.address, recipient.address, amount))
          .to.emit(facuTheRockCoin, 'Transfer')
          .withArgs(sender.address, recipient.address, amount);
    });

    it("Mint tokens adds 1 token to total supply", async () => {
        // Act
        await facuTheRockCoin.connect(owner).mint();

        // Assert
        const currentTotalSupply = await facuTheRockCoin.totalSupply();

        expect(currentTotalSupply).to.equal(toUnits(TOTAL_SUPPLY + 1));
    });

    it("Mint tokens adds 1 token to balance", async () => {
        // Act
        await facuTheRockCoin.connect(owner).mint();

        // Assert
        const currentBalance = await facuTheRockCoin.balanceOf(owner.address);

        expect(currentBalance).to.equal(toUnits(TOTAL_SUPPLY + 1));
    });

    it("Mint tokens adds 1 token to minted", async () => {
        // Act
        await facuTheRockCoin.connect(owner).mint();

        // Assert
        const currentMinted = await facuTheRockCoin.minted(owner.address);

        expect(currentMinted).to.equal(toUnits(1));
    });

    it("Mint set cooldown period for the owner to block.timestamp", async () => {
        // Arrange
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
        
        // Act
        await facuTheRockCoin.connect(owner).mint();

        // Assert
        const currentCooldown = await facuTheRockCoin.cooldown(owner.address);

        expect(currentCooldown).to.equal(currentBlock.timestamp + 1);
    });

    it("Cannot mint if cooldown period for sender is in progress", async () => {
        // Arrange
        await facuTheRockCoin.connect(owner).mint();
        
        // Act & Assert
        await expect(
            facuTheRockCoin.connect(owner).mint()
          ).to.be.revertedWith("COOLDOWN_PERIOD_IN_PROGRESS");
    });

    it("Can mint after one week of cooldown", async () => {
        // Arrange
        await facuTheRockCoin.connect(owner).mint();

        await addSevenDaysToBlockTimestamp();
        
        // Act
        await facuTheRockCoin.connect(owner).mint();

        // Assert
        const currentMinted = await facuTheRockCoin.minted(owner.address);

        expect(currentMinted).to.equal(toUnits(2));
    });

    it("Cannot mint if difference between balance and minted is less than 10 tokens", async () => {
        // Arrange
        await facuTheRockCoin.connect(owner).transfer(alice.address, toUnits(10));
        await facuTheRockCoin.connect(alice).mint();

        await addSevenDaysToBlockTimestamp();

        // Act & Assert
        await expect(
            facuTheRockCoin.connect(alice).mint()
          ).to.be.revertedWith("INSUFFICIENT_FUNDS");
    });

    it("Can mint when balance increments by 10 tokens", async () => {
        // Arrange
        await facuTheRockCoin.connect(owner).transfer(alice.address, toUnits(10));
        await facuTheRockCoin.connect(alice).mint();

        await addSevenDaysToBlockTimestamp();

        await facuTheRockCoin.connect(owner).transfer(alice.address, toUnits(10));

        // Act
        await facuTheRockCoin.connect(alice).mint();

        // Assert
        const currentMinted = await facuTheRockCoin.minted(alice.address);

        expect(currentMinted).to.equal(toUnits(2));
    });

    it("Mint emits Transfer event", async () => {
        // Arrange
        await facuTheRockCoin.connect(owner).transfer(alice.address, toUnits(10));

        // Act & Assert
        await expect(facuTheRockCoin.connect(alice).mint())
          .to.emit(facuTheRockCoin, 'Transfer')
          .withArgs(EMPTY_ADDRESS, alice.address, toUnits(1));
    });

    it("Cannot burn zero amount", async () => {      
        // Act & Assert
        await expect(
            facuTheRockCoin.connect(alice).burn(0)
          ).to.be.revertedWith("INVALID_AMOUNT");
    });

    it("Cannot burn if funds are not enough", async () => {
        // Act & Assert
        await expect(
            facuTheRockCoin.connect(alice).burn(toUnits(1))
          ).to.be.revertedWith("INSUFFICIENT_FUNDS");
    });

    it("Can burn tokens", async () => {
        // Arrange
        const balance = toUnits(10);
        const burnt = toUnits(1);
        await facuTheRockCoin.connect(owner).transfer(alice.address, balance);

        // Act
        await facuTheRockCoin.connect(alice).burn(burnt);

        // Assert
        const aliceBalance = await facuTheRockCoin.balanceOf(alice.address);

        expect(aliceBalance).to.equal(balance - burnt);
    });

    it("Burn emits Transfer event", async () => {
        // Arrange
        const balance = toUnits(10);
        const burnt = toUnits(1);
        await facuTheRockCoin.connect(owner).transfer(alice.address, balance);

        // Act & Assert
        await expect(facuTheRockCoin.connect(alice).burn(burnt))
          .to.emit(facuTheRockCoin, 'Transfer')
          .withArgs(alice.address, EMPTY_ADDRESS, burnt);
    });
});