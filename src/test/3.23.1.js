const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_23_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.23.1";
        this.description = "GrantToken - Element GrantedAttributeAuthority MUST NOT be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions!=null && Extensions.GrantedAttributeAuthority!=null) {
            this.notes = Extensions;
            throw("Extension GrantedAttributeAuthority is present");
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_23_1