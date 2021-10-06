import { expect } from "chai";
import { ethers } from "hardhat";

describe("Engine", function () {
  it("Should return the new Engine once it's deployed", async function () {
    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    expect(await engine.address).to.exist;
  });
});
