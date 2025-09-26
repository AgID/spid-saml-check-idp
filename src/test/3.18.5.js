const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_18_5 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.18.5";
        this.description = "GrantToken - Element GrantedAttributeAuthority MUST contains at least one element GrantToken";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions==null || Extensions.GrantedAttributeAuthority==null) {
            this.notes = Extensions;
            throw("Extension GrantedAttributeAuthority is not present");
        }
        
        if(Extensions!=null && Extensions.GrantedAttributeAuthority!=null 
            && Extensions.GrantedAttributeAuthority.length==0) {
            this.notes = Extensions;
            throw("Element GrantedAttributeAuthority does not contains any GrantToken elements");
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_18_5