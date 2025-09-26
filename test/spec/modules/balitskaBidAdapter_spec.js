import { expect } from "chai";
import { spec } from "../../../modules/balitskaBigAdapter.js";

const BID = {
  bidId: "test-bidid",
  mediaTypes: { banner: { sizes: [[300, 250]] } },
  params: { placementId: "123" },
};

const BIDDER_REQUEST = {
  auctionId: "auc-1",
  refererInfo: { page: "https://site.test/page" },
};
describe("balitska adapter", () => {
  it("validates bid", () => {
    expect(spec.isBidRequestValid(BID)).to.equal(true);
    expect(spec.isBidRequestValid({ params: {} })).to.equal(false);
  });

  it("builds request", () => {
    const req = spec.buildRequests([BID], BIDDER_REQUEST);
    expect(req.method).to.equal("POST");
    const body = JSON.parse(req.data);
    expect(body.imp).to.have.length(1);
    expect(body.imp[0].tagid).to.equal("123");
  });

  it("interprets response", () => {
    const serverResponse = {
      body: {
        cur: "USD",
        seatbid: [
          {
            bid: [
              {
                impid: "test-bidid",
                price: 0.5,
                w: 300,
                h: 250,
                adm: "<div>ad</div>",
              },
            ],
          },
        ],
      },
    };
    const out = spec.interpretResponse(serverResponse);
    expect(out).to.have.length(1);
    expect(out[0].cpm).to.equal(0.5);
    expect(out[0].ad).to.contain("<div>");
  });

  it("handles empty", () => {
    const out = spec.interpretResponse({ body: { seatbid: [] } });
    expect(out).to.be.an("array").that.is.empty;
  });
});
