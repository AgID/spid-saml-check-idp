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


class Test_1_3_7 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.7";
        this.description = "One or more signing KeyDescriptor elements MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let keyDescriptor = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:KeyDescriptor[@use='signing']", doc);

        if(keyDescriptor.length==0) {
            throw("Signing KeyDescriptor elements are not present");
        }

        return true;
    }

}

module.exports = Test_1_3_7