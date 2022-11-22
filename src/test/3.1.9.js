const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_1_9 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.1.9";
        this.description = "Attribute Destination MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Destination = this.authresponse.Destination;

        if(Destination==null || Destination=='') {
            this.notes = Destination;
            throw("Attribute Destination is not present or it is empty");
        }

        this.notes = Destination;
        return true;        
    }

}

module.exports = Test_3_1_9