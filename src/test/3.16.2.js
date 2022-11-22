const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_3_16_2 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.16.2";
        this.description = "Attribute element - Attribute Name MUST be a valid SPID attribute";
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
            } else {
                if(attribute.Name!='spidCode'
                && attribute.Name!='name'
                && attribute.Name!='familyName'
                && attribute.Name!='placeOfBirth'
                && attribute.Name!='countyOfBirth'
                && attribute.Name!='dateOfBirth'
                && attribute.Name!='gender'
                && attribute.Name!='companyName'
                && attribute.Name!='registeredOffice'
                && attribute.Name!='fiscalNumber'
                && attribute.Name!='companyFiscalNumber'
                && attribute.Name!='ivaCode'
                && attribute.Name!='idCard'
                && attribute.Name!='mobilePhone'
                && attribute.Name!='email'
                && attribute.Name!='address'
                && attribute.Name!='digitalAddress'
                && attribute.Name!='expirationDate'
                && attribute.Name!='domicileStreetAddress'
                && attribute.Name!='domicilePostalCode'
                && attribute.Name!='domicileMunicipality'
                && attribute.Name!='domicileProvince'
                && attribute.Name!='domicileNation'
            ) {
                this.notes = attribute;
                throw("Attribute Name is not a valid SPID attribute");
            }
            }
        }

        this.notes = AttributeStatement;
        return true;        
    }

}

module.exports = Test_3_16_2