const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_16_1 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.16.1";
        this.description = "Attribute element - Attribute Name MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Assertion = this.authresponse.Assertion;
        if(Assertion==null || Assertion=='') {
            this.notes = Assertion;
            throw("Element Assertion is not present or it is empty");
        }

        let AttributeStatement = this.authresponse.Assertion.AttributeStatement;
        if(AttributeStatement==null || AttributeStatement=='') {
            this.notes = this.authresponse.Assertion;
            throw("Element AttributeStatement is not present or it is empty");
        }

        for(let a in AttributeStatement) {
            let attribute = AttributeStatement[a];
            if(attribute.Name==null || attribute.Name=='') {
                this.notes = attribute;
                throw("Attribute Name is not present");
            }
        }

        this.notes = AttributeStatement;
        return true;        
    }

}

module.exports = Test_3_16_1