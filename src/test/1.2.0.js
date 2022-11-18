const TestMetadata = require('../server/lib/test/TestMetadata.js');
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_2_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.0";
        this.description = "Only one EntityDescriptor element MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let EntityDescriptor = select("//md:EntityDescriptor", doc);

        if(EntityDescriptor.length>1) {
            this.notes = EntityDescriptor.toString();
            throw("More than one EntityDescriptor element are present");
        }

        this.notes = this.metadata.url;
        return true;        
    }

}

module.exports = Test_1_2_0 