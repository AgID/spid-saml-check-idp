const TestMetadata = require('../server/lib/test/TestMetadata.js');
const validator = require("../server/node_modules/validator");
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_7_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.7.0";
        this.description = "The value of Name attribute MUST be one of [spidCode, name, familyName, placeOfBirth, countyOfBirth, dateOfBirth, gender, companyName, registeredOffice, fiscalNumber, companyFiscalNumber, address, ivaCode, idCard, mobilePhone, email, expirationDate, digitalAddress, domicileStreetAddress, domicilePostalCode, domicileMunicipality, domicileProvince, domicileNation]";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let attribute = select("//md:EntityDescriptor/md:IDPSSODescriptor/saml:Attribute", doc);

        for(let a in attribute) {
            let name = attribute[a].getAttribute("Name");
            this.notes += " " + name;
            if(name!='spidCode'
                && name!='name'
                && name!='familyName'
                && name!='placeOfBirth'
                && name!='countyOfBirth'
                && name!='dateOfBirth'
                && name!='gender'
                && name!='companyName'
                && name!='registeredOffice'
                && name!='fiscalNumber'
                && name!='companyFiscalNumber'
                && name!='address'
                && name!='ivaCode'
                && name!='idCard'
                && name!='mobilePhone'
                && name!='email'
                && name!='expirationDate'
                && name!='digitalAddress'
                && name!='domicileStreetAddress'
                && name!='domicilePostalCode'
                && name!='domicileMunicipality'
                && name!='domicileProvince'
                && name!='domicileNation'
            ) {
                this.notes = name;
                throw("The value of Name attribute is not one of SPID attributes");
            }
        }

        return true;
    }

}

module.exports = Test_1_7_0