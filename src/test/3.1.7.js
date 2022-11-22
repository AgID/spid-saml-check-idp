const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_1_7 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.1.7";
        this.description = "Attribute InResponseTo MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let InResponseTo = this.authresponse.InResponseTo;

        if(InResponseTo==null || InResponseTo=='') {
            this.notes = InResponseTo;
            throw("Attribute InResponseTo is not present or it is empty");
        }

        this.notes = InResponseTo;
        return true;        
    }

}

module.exports = Test_3_1_7 