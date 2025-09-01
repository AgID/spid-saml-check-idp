const TestMetadata = require('../server/lib/test/TestMetadata.js');
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/@xmldom/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_2_1 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.1";
        this.description = "The entityID attribute MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let EntityDescriptor = select("//md:EntityDescriptor", doc);
        let EntityId = select("//md:EntityDescriptor", doc)[0].getAttribute("entityID");

        if(EntityId==null || EntityId=='') {
            this.notes = EntityDescriptor.toString();
            throw("The entityID attribute is not present");
        }

        this.notes = EntityId;
        return true;        
    }

}

module.exports = Test_1_2_1