const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const AuthnResponse = require("../server/lib/AuthnResponse.js").AuthnResponse;
const SIGN_VALID_MODE = require("../server/lib/AuthnResponse.js").SIGN_VALID_MODE;
const {X509Certificate} = require('crypto');

class Test_3_20_3 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.20.3";
        this.description = "The signature MUST use RSA keys >= 1024 bit";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let authnresponse = new AuthnResponse(this.authresponse.SAMLResponse);
        let metadata = this.metadata.configuration;
        
        try {
            const pem = authnresponse.getResponseSignatureX509Certificate();
            const certificate = new X509Certificate(pem);
            const publicKey = certificate.publicKey;
            let keyDetails = publicKey.asymmetricKeyDetails

            if(keyDetails.modulusLength<1024) {
                throw("The signature does not use RSA keys >= 1024 bit: " + keysize)
            }

            this.notes = keyDetails.modulusLength;

            
        } catch(err) {
            this.notes = err.toString();
            throw("Error during signature validation");
        }       

        return true;
    }

}

module.exports = Test_3_20_3