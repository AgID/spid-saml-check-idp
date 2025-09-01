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


class Test_1_2_3 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.3";
        this.description = "The value of entityID SHOULD be a valid HTTPS URL";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let EntityDescriptor = select("//md:EntityDescriptor", doc);
        let EntityId = select("//md:EntityDescriptor", doc)[0].getAttribute("entityID");

        if(!validator.isURL(EntityId, {protocols: ['https']})) {
            this.notes = EntityId;
            throw("The value of entityID is not a valid HTTPS URL");
        }

        this.notes = EntityId;
        return true;
    }

}

module.exports = Test_1_2_3