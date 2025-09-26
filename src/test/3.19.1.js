const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_19_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.19.1";
        this.description = "GrantToken - Attribute Destination MUST be present";
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

        for(let t in Extensions.GrantedAttributeAuthority[0]) {
            let grantToken = Extensions.GrantedAttributeAuthority[0][t];
            if(grantToken.Destination==null) {
                this.notes = grantToken;
                throw("Attribute Destination of GrantToken is not present");
            }
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_19_1