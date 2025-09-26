const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_20_3 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.20.3";
        this.description = "Attribute Authority selection on IdP interface - The name MUST be shown";
        this.validation = "self";
    }

    async exec() {

        this.authrequest = null;
    }

}

module.exports = Test_2_20_3