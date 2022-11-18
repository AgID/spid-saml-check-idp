const TestMetadata = require('../server/lib/test/TestMetadata.js');
const { execSync } = require('child_process');
const tmp = require('../server/node_modules/tmp');
const fs = require('fs');

class Test_1_0_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.0.0";
        this.description = "Test the compliance against SAML2 standard XSD";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        try {
            const tmp_file = tmp.fileSync({ postfix: '.xml' });
            fs.writeFileSync(tmp_file.name, this.metadata.configuration); 

            let cmd = "xmllint --noout --schema xsd/saml-schema-metadata-2.0.xsd " + tmp_file.name;
            let out = execSync(cmd);
            tmp_file.removeCallback();

            this.notes = this.metadata.url;
            return true;

        } catch(error) {
            this.notes = error.message;
            throw("Metadata file is not compliant with SAML2 standard XSD");
        }
        
    }

}

module.exports = Test_1_0_0 