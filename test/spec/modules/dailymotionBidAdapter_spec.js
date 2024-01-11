import { config } from 'src/config.js';
import { expect } from 'chai';
import { spec } from 'modules/dailymotionBidAdapter.js';

describe('dailymotionBidAdapterTests', function () {
  it('validate_isBidRequestValid', function () {
    // validate that isBidRequestValid only validates requests with both api_key and position config parameters set
    config.setConfig({dailymotion: {}});
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.equal(false);
    config.setConfig({dailymotion: { api_key: 'test_api_key' }});
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.equal(false);
    config.setConfig({dailymotion: { position: 'test_position' }});
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.equal(false);
    config.setConfig({dailymotion: { api_key: 'test_api_key', position: 'test_position' }});
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.equal(true);
  });

  it('validate_buildRequests', function () {
    // validate request generation both with and without auth/xid parameters
    let dmConfig = { api_key: 'test_api_key', position: 'test_position' }
    config.setConfig({ dailymotion: dmConfig });
    config.setConfig({ coppa: true });
    let bidRequestData = [{
      adUnitCode: 'test_adunitcode',
      auctionId: 'b06c5141-fe8f-4cdf-9d7d-54415490a917',
      bidId: 123456,
      bidder: 'dailymotion',
    }];
    let bidderRequestData = {
      uspConsent: '1YN-',
      gdprConsent: {
        consentString: 'xxx',
        gdprApplies: 1
      },
    }

    let request = spec.buildRequests(bidRequestData, bidderRequestData);
    let req_data = request[0].data;

    expect(request[0].url).to.equal('https://pb.dmxleo.com');
    expect(req_data.bidder_request).to.equal(bidderRequestData)
    expect(req_data.config).to.equal(dmConfig);
    expect(req_data.coppa).to.equal(true);
    expect(req_data.request).to.equal(bidRequestData[0])

    dmConfig = { api_key: 'test_api_key', leo_auth: 'test_auth', position: 'test_position', xid: 'x123456' };
    config.setConfig({ dailymotion: dmConfig });

    bidRequestData = [{
      adUnitCode: 'test_adunitcode',
      auctionId: 'b06c5141-fe8f-4cdf-9d7d-54415490a917',
      bidId: 123456,
      bidder: 'dailymotion',
    }];
    request = spec.buildRequests(bidRequestData, bidderRequestData);
    req_data = request[0].data;

    expect(request[0].url).to.equal('https://pb.dmxleo.com');
    expect(req_data.bidder_request).to.equal(bidderRequestData)
    expect(req_data.config).to.equal(dmConfig);
    expect(req_data.coppa).to.equal(true);
    expect(req_data.request).to.equal(bidRequestData[0])
  });

  it('validate_interpretResponse', function () {
    let bidRequest = {
      data: {
      }
    };
    let serverResponse = {
      body: {
        ad: 'https://fakecacheserver/cache?uuid=1234',
        cacheId: '1234',
        cpm: 20.0,
        creativeId: '5678',
        currency: 'USD',
        dealId: 'deal123',
        nurl: 'https://bid/nurl',
        requestId: 'test_requestid',
        vastUrl: 'https://fakecacheserver/cache?uuid=1234',
      }
    };

    let bids = spec.interpretResponse(serverResponse, bidRequest);
    expect(bids).to.have.lengthOf(1);
    let bid = bids[0];
    expect(bid.ad).to.equal(serverResponse.body.ad);
    expect(bid.cacheId).to.equal(serverResponse.body.cacheId);
    expect(bid.cpm).to.equal(serverResponse.body.cpm);
    expect(bid.creativeId).to.equal(serverResponse.body.creativeId);
    expect(bid.currency).to.equal(serverResponse.body.currency);
    expect(bid.dealId).to.equal(serverResponse.body.dealId);
    expect(bid.nurl).to.equal(serverResponse.body.nurl);
    expect(bid.requestId).to.equal(serverResponse.body.requestId);
    expect(bid.vastUrl).to.equal(serverResponse.body.vastUrl);
  });
});
