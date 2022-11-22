const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_9_5 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.9.5";
        this.description = "Assertion - The value of InResponseTo MUST be equal to the value of Request ID";
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

        if(InResponseTo!=this.authrequest.RequestID) {
            this.notes = {
                RequestID: this.authrequest.RequestID,
                InResponseTo: InResponseTo
            }
            throw("The value of InResponseTo is not equal to the value of Request ID");
        }

        this.notes = InResponseTo;
        return true;        
    }

}

module.exports = Test_3_9_5