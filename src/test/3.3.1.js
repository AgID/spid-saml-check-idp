const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_3_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.3.1";
        this.description = "The value of Issuer MUST be equal to the EntityID of IdP";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Issuer = this.authresponse.Issuer;

        if(Issuer==null || Issuer=='') {
            this.notes = Issuer;
            throw("Attribute Issuer is not present or it is empty");
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

module.exports = Test_3_3_1