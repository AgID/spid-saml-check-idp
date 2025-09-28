const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const AuthnResponse = require("../server/lib/AuthnResponse.js").AuthnResponse;
const SIGN_VALID_MODE = require("../server/lib/AuthnResponse.js").SIGN_VALID_MODE;
const {X509Certificate} = require('crypto');

class Test_3_20_4 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.20.4";
        this.description = "The signature digest algorithm MUST be >= SHA256";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let authnresponse = new AuthnResponse(this.authresponse.SAMLResponse);
        let metadata = this.metadata.configuration;
        
        try {
            let digestAlghoritm = authnresponse.getResponseSignatureDigestMethod();
            this.notes = digestAlghoritm;
            
            if(!['SHA256', 'SHA384', 'SHA512'].includes(digestAlghoritm)) {
                throws("The signature digest algorithm is not >= SHA256");
            }
            
        } catch(err) {
            this.notes = err.toString();
            throw("Error during signature validation");
        }       

        return true;
    }

}

module.exports = Test_3_20_4