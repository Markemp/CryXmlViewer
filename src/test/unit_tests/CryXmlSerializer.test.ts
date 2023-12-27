import { expect } from "chai";
import { CryXmlSerializer } from "../../utils/CryXmlSerializer";

describe("CryXmlSerializer Tests", () => {
  it("should correctly serialize cryxml file", async () => {
    const result = await CryXmlSerializer.readFile(
      "src/test/testFiles/crab_01.mtl",
      false
    );

    // Check if result matches expected XML
    expect(result).to.be.a("string"); // Add more specific checks as per your requirements
  });

  // Add more tests for different file types and scenarios
});
