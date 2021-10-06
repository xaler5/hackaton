import { expect } from "chai";
import { ethers } from "hardhat";

let owner;

describe("Motorbike", function () {
  it("Should return the new Motorbike once it's deployed", async function () {
    [owner] = await ethers.getSigners();
    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    const Motorbike = await ethers.getContractFactory("Motorbike");
    const motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();

    const proxiedMotorbike = await Engine.attach(motorbike.address);

    expect(await motorbike.address).to.exist;
    expect(await proxiedMotorbike.upgrader()).to.equal(owner.address)
  });
});
