const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_10_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.10.1";
        this.description = "Assertion - The value of Issuer MUST be equal to the EntityID of IdP";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Assertion = this.authresponse.Assertion;
        if(Assertion==null || Assertion=='') {
            this.notes = Assertion;
            throw("Element Assertion is not present or it is empty");
        }

        let Issuer = this.authresponse.Assertion.Issuer;
        if(Issuer==null || Issuer=='') {
            this.notes = this.authresponse.Assertion;
            throw("Element Issuer is not present or it is empty");
        }

        if(Issuer!=this.metadata.entity_id) {
            this.notes = {
                EntityID: this.metadata.entity_id,
                Issuer: Issuer
            }
            throw("The value of Issuer is not equal to the EntityID of IdP");
        }

        this.notes = Issuer;
        return true;        
    }

}

module.exports = Test_3_10_1