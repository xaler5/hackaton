import { expect } from "chai";
import { ethers } from "hardhat";

let owner, attacker;

describe("Attack", function () {
  it("Should complete the attack", async function () {
    // SETUP SCENARIO
    [owner, attacker] = await ethers.getSigners();

    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    const Motorbike = await ethers.getContractFactory("Motorbike");
    const motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();

    expect(await motorbike.address).to.exist;

    // PREPARE AN ATTACK CONTRACT
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(engine.address);
    await attack.deployed();

    // PROVE THAT PROXY CAN COMMUNICATE WITH IMPLEMENTATION
    let tx = await attack.validateItIsBroken();
    let isItBroken = await tx.wait();
    
    // Expect the implementation address to return true on "Address.isContract()"
    let eventsEmitted = isItBroken.events ? isItBroken.events : [];
    expect(eventsEmitted[0].args?.result).to.true;

    // Run the attack
    tx = await attack.destroy();
    let receipt = await tx.wait();

    tx = await attack.validateItIsBroken();
    isItBroken = await tx.wait()
    
    // Expect the implementation address to return false on "Address.isContract()"
    eventsEmitted = isItBroken.events ? isItBroken.events : [];
    expect(eventsEmitted[0].args?.result).to.false;

  });
});
