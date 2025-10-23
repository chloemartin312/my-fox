import { html, fixture, expect } from '@open-wc/testing';
import "../my-fox.js";

describe("MyFox test", () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`
      <my-fox
        title="title"
      ></my-fox>
    `);
  });

  it("basic will it blend", async () => {
    expect(element).to.exist;
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
