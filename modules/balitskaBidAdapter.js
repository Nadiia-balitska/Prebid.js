import { BANNER } from "../src/mediaTypes.js";
import { registerBidder } from "../src/adapters/bidderFactory.js";

const BIDDER_CODE = "balitska";
const AUCTION_PATH = "https://hb.balitska.com/openrtb2/auction";

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER],

  isBidRequestValid(bid) {
    const p = bid.params || {};
    return !!(p.placementId || p.endpoint);
  },

  buildRequests(validBidRequests, bidderRequest) {
    const url = validBidRequests[0]?.params?.endpoint || AUCTION_PATH;

    const imps = (validBidRequests || []).map((bid) => ({
      id: bid.bidId,
      tagid: bid.params?.placementId || "",
      banner: {
        format: (bid.mediaTypes?.banner?.sizes || bid.sizes || []).map(
          ([w, h]) => ({ w, h })
        ),
      },
    }));

    const payload = {
      id: bidderRequest?.auctionId,
      imp: imps,
      site: bidderRequest?.refererInfo?.page
        ? { page: bidderRequest.refererInfo.page }
        : undefined,
      tmax:
        typeof bidderRequest?.timeout === "number"
          ? bidderRequest.timeout
          : undefined,
    };

    const data = JSON.stringify(payload, (k, v) =>
      v === undefined ? undefined : v
    );

    return {
      method: "POST",
      url,
      data,
      options: { contentType: "application/json" },
    };
  },

  interpretResponse(serverResponse) {
    const body = serverResponse?.body || {};
    const out = [];

    (body.seatbid || []).forEach((seat) => {
      (seat.bid || []).forEach((b) => {
        out.push({
          requestId: b.impid || b.bidId,
          cpm: Number(b.price || b.cpm || 0),
          currency: body.cur || "USD",
          width: b.w,
          height: b.h,
          ad: b.adm,
          creativeId: b.crid || "balitska-crea",
          ttl: 180,
          netRevenue: true,
          meta: { advertiserDomains: b.adomain || [] },
        });
      });
    });

    return out;
  },

  getUserSyncs() {
    return [];
  },
};

registerBidder(spec);
export default spec;
