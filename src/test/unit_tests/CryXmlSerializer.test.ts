import { expect } from "chai";
import { CryXmlSerializer } from "../../utils/CryXmlSerializer";
import * as fs from "fs";

describe("CryXmlSerializer Tests", () => {
  it("should correctly serialize cryxml file", async () => {
    const fileBuffer = fs.readFileSync("src/test/testFiles/crab_01.mtl");
    const result = await CryXmlSerializer.readFile(fileBuffer);

    // Check if result matches expected XML
    expect(result).to.be.a("string"); // Add more specific checks as per your requirements
    // Check that the number of lines in result matches the number of lines in expected XML
    expect(result.split("\n").length).to.equal(20);
  });

  // Add more tests for different file types and scenarios
});
