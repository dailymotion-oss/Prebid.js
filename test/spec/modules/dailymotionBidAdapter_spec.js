import { config } from 'src/config.js';
import { expect } from 'chai';
import { spec } from 'modules/dailymotionBidAdapter.js';
import { VIDEO } from '../../../src/mediaTypes';

describe('dailymotionBidAdapterTests', () => {
  const videoMetadata = {
    description: 'this is a test video',
    duration: 556,
    iabcat2: 'test_cat',
    id: '54321',
    lang: 'FR',
    private: false,
    tags: 'tag_1,tag_2,tag_3',
    title: 'test video',
    topics: 'topic_1, topic_2',
  }
  // Validate that isBidRequestValid only validates requests
  // with both api_key and position config parameters set
  it('validates isBidRequestValid', () => {
    config.setConfig({ dailymotion: {} });
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.be.false;

    config.setConfig({ dailymotion: { api_key: 'test_api_key' } });
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.be.false;

    config.setConfig({ dailymotion: { position: 'test_position' } });
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.be.false;

    config.setConfig({ dailymotion: { api_key: 'test_api_key', position: 'test_position' } });
    expect(spec.isBidRequestValid({
      bidder: 'dailymotion',
    })).to.be.true;
  });

  // Validate request generation with api key & position only
  it('validates buildRequests - with api key & position', () => {
    const dmConfig = { api_key: 'test_api_key', position: 'test_position' };

    config.setConfig({
      dailymotion: dmConfig,
      coppa: true,
    });

    const bidRequestData = [{
      auctionId: 'b06c5141-fe8f-4cdf-9d7d-54415490a917',
      bidId: 123456,
      mediaTypes: {
        video: {
          playerSize: [[1280, 720]],
          api: [2, 7],
          description: 'this is a test video',
          duration: 300,
          iabcat2: 'test_cat',
          lang: 'ENG',
        },
      },
      sizes: [[1920, 1080]],
      params: {
        video: {
          duration: 556,
          id: '54321',
          lang: 'FR',
          private: false,
          tags: 'tag_1,tag_2,tag_3',
          title: 'test video',
          topics: 'topic_1, topic_2',
        }
      },
    }];

    const bidderRequestData = {
      refererInfo: {
        page: 'https://publisher.com',
      },
      uspConsent: '1YN-',
      gdprConsent: {
        apiVersion: 2,
        consentString: 'xxx',
        gdprApplies: true,
      },
    };

    const [request] = spec.buildRequests(bidRequestData, bidderRequestData);
    const { data: reqData } = request;

    expect(request.url).to.equal('https://pb.dmxleo.com');

    expect(reqData.config).to.eql(dmConfig);
    expect(reqData.coppa).to.be.true;
    expect(reqData.bidder_request).to.eql(bidderRequestData)
    expect(reqData.request.auctionId).to.eql(bidRequestData[0].auctionId);
    expect(reqData.request.bidId).to.eql(bidRequestData[0].bidId);
    expect(reqData.request.mediaTypes.video.api).to.eql(bidRequestData[0].mediaTypes.video.api);
    expect(reqData.request.mediaTypes.video.playerSize).to.eql(bidRequestData[0].mediaTypes.video.playerSize);
    expect(reqData.video_metadata).to.eql(videoMetadata);
  });

  // Validate request generation with api key, position, xid
  it('validates buildRequests - with auth & xid', () => {
    const dmConfig = {
      api_key: 'test_api_key',
      position: 'test_position',
      xid: 'x123456',
    };

    config.setConfig({ dailymotion: dmConfig, coppa: undefined });

    const bidRequestData = [{
      auctionId: 'b06c5141-fe8f-4cdf-9d7d-54415490a917',
      bidId: 123456,
      mediaTypes: {
        video: {
          playerSize: [[1280, 720]],
          api: [2, 7],
          description: 'this is a test video',
          duration: 300,
          iabcat2: 'test_cat',
        },
      },
      sizes: [[1920, 1080]],
      params: {
        video: {
          duration: 556,
          id: '54321',
          lang: 'FR',
          private: false,
          tags: 'tag_1,tag_2,tag_3',
          title: 'test video',
          topics: 'topic_1, topic_2',
        }
      },
    }];

    const bidderRequestData = {
      refererInfo: {
        page: 'https://publisher.com',
      },
      uspConsent: '1YN-',
      gdprConsent: {
        apiVersion: 2,
        consentString: 'xxx',
        gdprApplies: 1,
      },
    };

    const [request] = spec.buildRequests(bidRequestData, bidderRequestData);
    const { data: reqData } = request;

    expect(request.url).to.equal('https://pb.dmxleo.com');

    expect(reqData.config).to.eql(dmConfig);
    expect(reqData.coppa).to.be.undefined;

    expect(reqData.bidder_request).to.eql({
      ...bidderRequestData,
      gdprConsent: {
        ...bidderRequestData.gdprConsent,
        gdprApplies: true, // Verify cast to boolean
      },
    });

    expect(reqData.request.auctionId).to.eql(bidRequestData[0].auctionId);
    expect(reqData.request.mediaTypes.video.playerSize).to.eql(bidRequestData[0].mediaTypes.video.playerSize);
    expect(reqData.request.bidId).to.eql(bidRequestData[0].bidId);
    expect(reqData.request.mediaTypes.video.api).to.eql(bidRequestData[0].mediaTypes.video.api);
    expect(reqData.video_metadata).to.eql(videoMetadata);
  });

  it('validates buildRequests - with default values on empty bid & bidder request', () => {
    const dmConfig = {
      api_key: 'test_api_key',
      position: 'test_position',
      xid: 'x123456',
    };

    config.setConfig({ dailymotion: dmConfig, coppa: false });

    const [request] = spec.buildRequests([{}], {});
    const { data: reqData } = request;

    expect(request.url).to.equal('https://pb.dmxleo.com');

    expect(reqData.config).to.eql(dmConfig);
    expect(reqData.coppa).to.be.false;

    expect(reqData.bidder_request).to.eql({
      gdprConsent: {
        apiVersion: 1,
        consentString: '',
        gdprApplies: false,
      },
      refererInfo: {
        page: '',
      },
      uspConsent: '',
    });

    expect(reqData.request).to.eql({
      auctionId: '',
      bidId: '',
      mediaTypes: {
        video: {
          playerSize: [],
          api: [],
        },
      },
      sizes: [],
    });
  });

  it('validates buildRequests - with empty/undefined validBidRequests', () => {
    const dmConfig = {
      api_key: 'test_api_key',
      position: 'test_position',
      xid: 'x123456',
    };

    config.setConfig({ dailymotion: dmConfig });

    expect(spec.buildRequests([], {})).to.have.lengthOf(0);

    expect(spec.buildRequests(undefined, {})).to.have.lengthOf(0);
  });

  it('validates interpretResponse', () => {
    const serverResponse = {
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
      },
    };

    const bids = spec.interpretResponse(serverResponse);
    expect(bids).to.have.lengthOf(1);

    const [bid] = bids;
    expect(bid).to.eql(serverResponse.body);
  });

  it('validates interpretResponse - with empty/undefined serverResponse', () => {
    expect(spec.interpretResponse({})).to.have.lengthOf(0);

    expect(spec.interpretResponse(undefined)).to.have.lengthOf(0);
  });
});
