const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_18_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.18.1";
        this.description = "GrantToken - Element Extensions MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions==null) {
            this.notes = Extensions;
            throw("Element Extensions is not present");
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_18_1