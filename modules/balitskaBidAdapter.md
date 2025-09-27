# Balitska Prebid Adapter
Bidder code: balitska
Formats: Banner
Default endpoint: https://hb.balitska.com/openrtb2/auction

## Params
{
  bidder: 'balitska',
  params: {
    placementId: 'STRING',        // required (або вкажи кастомний endpoint)
    endpoint: 'https://...'       // optional: перекриває endpoint за замовчуванням
  }
}

## Exzmple `adUnits`
const adUnits = [{
  code: 'div-gpt-ad-300x250',
  mediaTypes: { banner: { sizes: [[300, 250], [300, 600]] } },
  bids: [{ bidder: 'balitska', params: { placementId: '12345' } }]
}];

## Expected SSP response (simplified OpenRTB)

{
  "id": "auction-1",
  "cur": "USD",
  "seatbid": [
    {
      "bid": [
        {
          "impid": "<bidId>",
          "price": 0.7,
          "w": 300,
          "h": 250,
          "adm": "<html creative>",
          "adomain": ["advertiser.example"],
          "crid": "creative-123"
        }
      ]
    }
  ]
}

## Build / Lint / Test

# лінт
npx gulp lint

# тести лише для цього адаптера
npx gulp test --browsers ChromeHeadless --modules=balitskaBidAdapter

# кастомний білд із цим адаптером
npx gulp build --modules=balitskaBidAdapter
# (якщо потрібно з мінімізацією)
npx gulp build --modules=balitskaBidAdapter --dist
