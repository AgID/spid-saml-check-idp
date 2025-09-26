const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const Utils = require("../server/lib/utils.js");

class Test_3_19_4 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.19.4";
        this.description = "GrantToken - The value of the GrantToken element MUST be a valid JWT";
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

            if(!Utils.isJWT(grantToken.GrantToken, true)) {
                this.notes = grantToken.GrantToken;
                throw("GrantToken is not a valid JWE");
            }
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_19_4