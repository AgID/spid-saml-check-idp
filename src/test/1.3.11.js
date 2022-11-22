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


class Test_1_3_11 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.11";
        this.description = "One or more SingleSignOnService element MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let doc = new DOMParser().parseFromString(this.metadata.configuration);
        let singleSignOnService = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:SingleSignOnService", doc);

        if(singleSignOnService.length==0) {
            throw("SingleSignOnService elements are not present");
        }

        return true;
    }

}

module.exports = Test_1_3_11