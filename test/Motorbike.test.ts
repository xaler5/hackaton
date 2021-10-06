import { expect } from "chai";
import { ethers } from "hardhat";

describe("Motorbike", function () {
  it("Should return the new Motorbike once it's deployed", async function () {
    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    const Motorbike = await ethers.getContractFactory("Motorbike");
    const motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();

    expect(await motorbike.address).to.exist;
  });
});
