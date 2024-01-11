import { config } from '../src/config.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';
import { VIDEO } from '../src/mediaTypes.js';

export const spec = {
  code: 'dailymotion',
  gvlid: 573,
  supportedMediaTypes: [VIDEO],

  /**
   * Determines whether or not the given bid request is valid.
   * The only mandatory parameters for a bid to be valid are the api_key and position configuration entries.
   * Other parameters are optional.
   *
   * @param {object} bid The bid to validate.
   * @return boolean True if this is a valid bid, and false otherwise.
   */
  isBidRequestValid: function (bid) {
    const dmConfig = config.getConfig('dailymotion');
    if (!dmConfig?.api_key) {
      return false;
    }
    if (!dmConfig?.position) {
      return false;
    }
    return true;
  },

  /**
   * Make a server request from the list of valid BidRequests (that already passed the isBidRequestValid call)
   *
   * @param {BidRequest[]} validBidRequests A non-empty list of valid bid requests that should be sent to the Server.
   * @return ServerRequest Info describing the request to the server.
   */
  buildRequests: function (validBidRequests, bidderRequest) {
    const requests = validBidRequests.map(function (bid) {
      const dmConfig = config.getConfig('dailymotion');
      return {
        method: 'POST',
        url: 'https://pb.dmxleo.com',
        data: {
          bidder_request: bidderRequest,
          config: dmConfig,
          coppa: config.getConfig('coppa'),
          request: bid,
        },
        options: {
          withCredentials: true,
          crossOrigin: true
        },
      }
    });

    return requests;
  },

  /**
   * Map the response from the server into a list of bids.
   * As dailymotion prebid server returns an entry with the correct Prebid structure,
   * we directly include it as the only bid in the response.
   *
   * @param {*} serverResponse A successful response from the server.
   * @return {Bid[]} An array of bids which were nested inside the server.
   */
  interpretResponse: function (serverResponse, bidRequest) {
    if (!serverResponse || !serverResponse.body) {
      return [];
    }

    // all the response formatting is handled by Prebid backend Service
    return [serverResponse.body];
  }
};

registerBidder(spec);
