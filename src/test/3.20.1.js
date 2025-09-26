const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const AuthnResponse = require("../server/lib/AuthnResponse.js").AuthnResponse;
const SIGN_VALID_MODE = require("../server/lib/AuthnResponse.js").SIGN_VALID_MODE;

class Test_3_20_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.20.1";
        this.description = "The SAML Response Signature element MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let authnresponse = new AuthnResponse(this.authresponse.SAMLResponse);
        let metadata = this.metadata.configuration;
        
        try {
            authnresponse.validateSignature(metadata, SIGN_VALID_MODE.RESPONSE);
            
        } catch(err) {
            this.notes = err;
            throw("Error during signature validation");
        }       

        return true;
    }

}

module.exports = Test_3_20_1