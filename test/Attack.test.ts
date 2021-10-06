import { expect } from "chai";
import { ethers } from "hardhat";

let owner, attacker;

describe("Attack", function () {
  it("Should complete the attack", async function () {
    [owner, attacker] = await ethers.getSigners();

    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    const Motorbike = await ethers.getContractFactory("Motorbike");
    const motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();

    expect(await motorbike.address).to.exist;

    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(engine.address);
    await attack.deployed();

    const tx = await attack.destroy();
    const receipt = await tx.wait();
    console.log(receipt);
  });
});
