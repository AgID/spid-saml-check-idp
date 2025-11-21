const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_18_4 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.18.4";
        this.description = "GrantToken - Element GrantedAttributeAuthority MUST have namespace xmlns:spid='https://spid.gov.it/saml-extensions'";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;
        let ExtensionsNamespace = this.authresponse.ExtensionsNamespace;

        if(Extensions==null || Extensions.GrantedAttributeAuthority==null) {
            this.notes = Extensions;
            throw("Extension GrantedAttributeAuthority is not present");
        }
        
        if(Extensions!=null && Extensions.GrantedAttributeAuthority!=null 
            && Extensions.GrantedAttributeAuthority.length==0) {
            this.notes = Extensions;
            throw("Element GrantedAttributeAuthority does not contains any GrantToken elements");
        }

        if(ExtensionsNamespace['GrantedAttributeAuthority']!='https://spid.gov.it/saml-extensions') {
            this.notes = Extensions;
            throw("Element GrantedAttributeAuthority does not have namespace xmlns:spid='https://spid.gov.it/saml-extensions'");
        }

        this.notes = ExtensionsNamespace['GrantedAttributeAuthority'];
        return true;        
    }

}

module.exports = Test_3_18_4