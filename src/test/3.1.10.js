const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const config_server = require("../config/server.json");

class Test_3_1_10 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.1.10";
        this.description = "The value of attribute Destination MUST be equal to the URI of SP";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Destination = this.authresponse.Destination;

        if(Destination==null || Destination=='') {
            this.notes = Destination;
            throw("Attribute Destination is not present or it is empty");
        }

        if(Destination!=config_server.host + '/samlacs') {
            this.notes = Destination;
            throw("Attribute Destination is not equal to the URI of SP");
        }

        this.notes = Destination;
        return true;        
    }

}

module.exports = Test_3_1_10