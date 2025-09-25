const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_19_3 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.19.3";
        this.description = "GrantToken - The GrantToken element MUST have a value";
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
            if(grantToken.GrantToken==null || grantToken.GrantToken=='') {
                this.notes = grantToken;
                throw("GrantToken does not have a value");
            }        
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_19_3