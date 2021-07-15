import { number } from "../src/index";
describe("jschain", () => {
  it("number", () => {
    expect(number(2).toString().value).toEqual("2");
    expect(number(3).toString().value).toEqual("3");
  });
});
