const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_14_2 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.14.2";
        this.description = "Assertion - The value of AuthnContextClassRef MUST be one of [“https://www.spid.gov.it/SpidL1”, “https://www.spid.gov.it/SpidL2”, “https://www.spid.gov.it/SpidL3”]";
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

        if(AuthnContextClassRef!="https://www.spid.gov.it/SpidL1"
            && AuthnContextClassRef!="https://www.spid.gov.it/SpidL2"
            && AuthnContextClassRef!="https://www.spid.gov.it/SpidL3") {
            this.notes = this.authresponse.Assertion.AuthnStatement.AuthnContext;
            throw("The value of AuthnContextClassRef is not one of [“https://www.spid.gov.it/SpidL1”, “https://www.spid.gov.it/SpidL2”, “https://www.spid.gov.it/SpidL3”]");
        }

        this.notes = AuthnContextClassRef;
        return true;        
    }

}

module.exports = Test_3_14_2