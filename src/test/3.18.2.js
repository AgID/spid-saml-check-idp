const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_18_2 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.18.2";
        this.description = "GrantToken - Element GrantedAttributeAuthority MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions==null || Extensions.GrantedAttributeAuthority==null) {
            this.notes = Extensions;
            throw("Extension GrantedAttributeAuthority is not present");
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_18_2