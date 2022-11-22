const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_14_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.14.1";
        this.description = "Assertion - Element AuthnContextClassRef MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Assertion = this.authresponse.Assertion;
        if(Assertion==null || Assertion=='') {
            this.notes = Assertion;
            throw("Element Assertion is not present or it is empty");
        }

        let AuthnStatement = this.authresponse.Assertion.AuthnStatement;
        if(AuthnStatement==null || AuthnStatement=='') {
            this.notes = this.authresponse.Assertion;
            throw("Element AuthnStatement is not present or it is empty");
        }

        let AuthnContext = this.authresponse.Assertion.AuthnStatement.AuthnContext;
        if(AuthnContext==null || AuthnContext=='') {
            this.notes = this.authresponse.Assertion.AuthnStatement;
            throw("Element AuthnContext is not present or it is empty");
        }

        let AuthnContextClassRef = this.authresponse.Assertion.AuthnStatement.AuthnContext.AuthnContextClassRef;
        if(AuthnContextClassRef==null || AuthnContextClassRef=='') {
            this.notes = this.authresponse.Assertion.AuthnStatement.AuthnContext;
            throw("Element AuthnContextClassRef is not present or it is empty");
        }

        this.notes = AuthnContextClassRef;
        return true;        
    }

}

module.exports = Test_3_14_1