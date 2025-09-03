const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_20_5 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.20.5";
        this.description = "Attribute Authority selection on IdP interface - The AA MUST be selectable";
        this.validation = "self";
    }

    async exec() {

        this.authrequest = null;
    }

}

module.exports = Test_2_20_5