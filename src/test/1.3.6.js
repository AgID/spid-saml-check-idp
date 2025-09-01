const TestMetadata = require('../server/lib/test/TestMetadata.js');
const validator = require("../server/node_modules/validator");
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/@xmldom/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_3_6 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.6";
        this.description = "The WantAuthnRequestsSigned attribute MUST be “true”";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let idpSsoDescriptor = select("//md:EntityDescriptor/md:IDPSSODescriptor", doc);

        if(idpSsoDescriptor.length!=1) {
            throw("The IDPSSODescriptor element is not present");
        }

        let wantAuthnRequestsSigned = idpSsoDescriptor[0].getAttribute("WantAuthnRequestsSigned");
        if(wantAuthnRequestsSigned.toLowerCase()!='true') {
            this.notes = wantAuthnRequestsSigned;
            throw("The WantAuthnRequestsSigned is not true");
        }

        this.notes = wantAuthnRequestsSigned;

        return true;
    }

}

module.exports = Test_1_3_6