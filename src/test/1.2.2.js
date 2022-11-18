const TestMetadata = require('../server/lib/test/TestMetadata.js');
const namespaces = require("../server/lib/saml-protocol/namespaces");
const xmldom = require("../server/node_modules/xmldom");
const xpath = require("../server/node_modules/xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class Test_1_2_2 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.2";
        this.description = "The entityID attribute MUST have a value";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let EntityDescriptor = select("//md:EntityDescriptor", doc);
        let EntityId = select("//md:EntityDescriptor", doc)[0].getAttribute("entityID");

        if(EntityId==null || EntityId=='') {
            this.notes = EntityDescriptor.toString();
            throw("The entityID attribute is not present or is empty");
        }

        this.notes = EntityId;
        return true;        
    }

}

module.exports = Test_1_2_2