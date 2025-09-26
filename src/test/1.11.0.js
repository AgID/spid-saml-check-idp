const TestMetadata = require('../server/lib/test/TestMetadata.js');
const MetadataIDP = require("../server/lib/MetadataIDP.js");
const validator = require("../server/node_modules/validator");
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/@xmldom/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_11_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.11.0";
        this.description = "The metadata signature MUST be valid";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let metadata = new MetadataIDP(this.metadata.configuration);
        
        try {
            metadata.validateSignature();
            
        } catch(err) {
            this.notes = err;
            throw("Error during signature validation");
        }     

        return true;
    }

}

module.exports = Test_1_11_0