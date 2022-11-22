const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_1_8 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.1.8";
        this.description = "The value of InResponseTo MUST be equal to the value of Request ID";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let RequestID = this.authrequest.RequestID;
        let InResponseTo = this.authresponse.InResponseTo;

        if(InResponseTo==null || InResponseTo=='') {
            this.notes = InResponseTo;
            throw("Attribute InResponseTo is not present or it is empty");
        }
 
        if(InResponseTo!=RequestID) {
            this.notes = {
                RequestID: RequestID,
                InResponseTo: InResponseTo
            }
            throw("The value of InResponseTo is not equal to the value of Request ID");
        }

        this.notes = InResponseTo;
        return true;        
    }

}

module.exports = Test_3_1_8