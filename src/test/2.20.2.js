const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_20_2 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.20.2";
        this.description = "Attribute Authority selection on IdP interface - The value of logo URL MUST be equal to the value of logo_uri inside the AA metadata";
        this.validation = "self";
    }

    async exec() {

        this.authrequest = null;
    }

}

module.exports = Test_2_20_2