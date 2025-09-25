const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_18_0 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.18.0";
        this.description = "GrantToken - User does not select any AA, GrantedAttributeAuthority extensions MUST not be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions!=null && Extensions.GrantedAttributeAuthority!=null) {
            this.notes = Extensions.GrantedAttributeAuthority;
            throw("Extension GrantedAttributeAuthority is present");
        }

        this.notes = Extensions.GrantedAttributeAuthority;
        return true;        
    }

}

module.exports = Test_3_18_0 