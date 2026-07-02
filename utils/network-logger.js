class NetworkLogger {
  constructor(page) {
    this.page = page;
    this.requests = [];
    this.responses = [];
    this._setupListeners();
  }

  _setupListeners() {
    this.page.on('request', req => {
      this.requests.push({
        url: req.url(),
        method: req.method(),
        type: req.resourceType(),
        headers: req.headers(),
        timestamp: Date.now(),
      });
    });

    this.page.on('response', resp => {
      this.responses.push({
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method(),
        type: resp.request().resourceType(),
      });
    });
  }

  getUniqueUrls() {
    return [...new Set(this.requests.map(r => r.url))];
  }

  getFirebaseRequests() {
    return this.requests.filter(r => r.url.includes('firebase'));
  }

  getApiRequests() {
    return this.requests.filter(r => r.url.includes('api'));
  }

  getFailedResponses() {
    return this.responses.filter(r => r.status >= 400);
  }

  clear() {
    this.requests = [];
    this.responses = [];
  }

  printSummary() {
    console.log(`Total requests: ${this.requests.length}`);
    console.log(`Total responses: ${this.responses.length}`);
    console.log(`Unique URLs: ${this.getUniqueUrls().length}`);
    console.log(`Failed responses: ${this.getFailedResponses().length}`);
  }
}

module.exports = { NetworkLogger };
