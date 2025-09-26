const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_20_4 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.20.4";
        this.description = "Attribute Authority selection on IdP interface - The name MUST be equal to the value of organization_name inside the AA metadata";
        this.validation = "self";
    }

    async exec() {

        this.authrequest = null;
    }

}

module.exports = Test_2_20_4