const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_16_3 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.16.3";
        this.description = "Attribute element - Attribute Value MUST be present";
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
            if(attribute.Value==null) {
                this.notes = attribute;
                throw("Attribute Value is not present");
            }
        }

        this.notes = AttributeStatement;
        return true;        
    }

}

module.exports = Test_3_16_3