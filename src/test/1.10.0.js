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


class Test_1_10_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.10.0";
        this.description = "The Signature element MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let signature = select("//md:EntityDescriptor/ds:Signature", doc);

        if(signature.length!=1) {
            throw("signature element is not present");
        }

        return true;
    }

}

module.exports = Test_1_10_0