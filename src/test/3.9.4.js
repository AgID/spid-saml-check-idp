const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_9_4 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.9.4";
        this.description = "Assertion - Attribute InResponseTo of element SubjectConfirmationData MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Assertion = this.authresponse.Assertion;
        if(Assertion==null || Assertion=='') {
            this.notes = Assertion;
            throw("Element Assertion is not present or it is empty");
        }

        let Subject = this.authresponse.Assertion.Subject;
        if(Subject==null || Subject=='') {
            this.notes = this.authresponse.Assertion;
            throw("Element Subject is not present or it is empty");
        }

        let SubjectConfirmation = this.authresponse.Assertion.Subject.SubjectConfirmation;
        if(SubjectConfirmation==null || SubjectConfirmation=='') {
            this.notes = this.authresponse.Assertion.Subject;
            throw("Element SubjectConfirmation is not present or it is empty");
        }

        let SubjectConfirmationData = this.authresponse.Assertion.Subject.SubjectConfirmation.SubjectConfirmationData;
        if(SubjectConfirmationData==null || SubjectConfirmationData=='') {
            this.notes = this.authresponse.Assertion.Subject.SubjectConfirmation;
            throw("Element SubjectConfirmationData is not present or it is empty");
        }

        let InResponseTo = this.authresponse.Assertion.Subject.SubjectConfirmation.SubjectConfirmationData.InResponseTo;
        if(InResponseTo==null || InResponseTo=='') {
            this.notes = this.authresponse.Assertion.Subject.SubjectConfirmation.SubjectConfirmationData;
            throw("Attribute InResponseTo is not present or it is empty");
        }

        this.notes = InResponseTo;
        return true;        
    }

}

module.exports = Test_3_9_4