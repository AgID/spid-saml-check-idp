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


class Test_1_2_6 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.6";
        this.description = "The Organization element SHOULD be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let organization = select("//md:EntityDescriptor/md:Organization", doc);

        if(organization.length!=1) {
            throw("The Organization element is not present");
        }

        return true;
    }

}

module.exports = Test_1_2_6