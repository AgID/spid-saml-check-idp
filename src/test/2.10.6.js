const fs = require("fs");
const path = require("path");
const base64url = require('../server/node_modules/base64url');
const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');
const Template = require('../server/lib/test/Template.js');
const Utility = require('../server/lib/utils.js');
const MetadataIDP = require('../server/lib/MetadataIDP.js');
const Signer = require('../server/lib/Signer.js').Signer;
const SIGN_MODE = require('../server/lib/Signer.js').SIGN_MODE;
const config_server = require('../config/server.json');
const config_sp = require('../config/sp.json');

const BINDING_REDIRECT = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";
const BINDING_POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

class Test_2_10_6 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.10.6";
        this.description = "The AuthnContexClassRef element does not have a value";
        this.validation = "required";
    }

    async exec() {

        const xmlt = "template_base-url";

        const sign_credentials = {
            signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
            certificate: fs.readFileSync(path.resolve(__dirname, '../config/spid-saml-check-idp-sig.crt')),
            privateKey: fs.readFileSync(path.resolve(__dirname, '../config/spid-saml-check-idp-sig.key'))
        };

        let template = new Template(path.resolve(__dirname, '../test'));
        let defaults = [];

        let protocolBinding = BINDING_POST;

        let metadata = new MetadataIDP(this.metadata.configuration);

        let requestID = Utility.getUUID();
        let destination = (protocolBinding==BINDING_POST)? metadata.getSingleSignOnService('HTTP-POST') : metadata.getSingleSignOnService('HTTP-Redirect');

        Utility.defaultParam(defaults, "RequestID", requestID);
        Utility.defaultParam(defaults, "IssueInstant", Utility.getInstant());
        Utility.defaultParam(defaults, "Destination", destination);
        Utility.defaultParam(defaults, "ForceAuthn", "true");
        Utility.defaultParam(defaults, "AssertionConsumerServiceURL", config_server.host + "/samlacs");
        Utility.defaultParam(defaults, "ProtocolBinding", protocolBinding);
        Utility.defaultParam(defaults, "AttributeConsumingServiceIndex", "0");
        Utility.defaultParam(defaults, "IssuerNameQualifier", config_sp.entity_id);
        Utility.defaultParam(defaults, "IssuerFormat", "urn:oasis:names:tc:SAML:2.0:nameid-format:entity");
        Utility.defaultParam(defaults, "Issuer", config_sp.entity_id);
        Utility.defaultParam(defaults, "NameIDPolicyFormat", "urn:oasis:names:tc:SAML:2.0:nameid-format:transient");
        Utility.defaultParam(defaults, "Comparison", "minimum");
        Utility.defaultParam(defaults, "AuthnContextClassRef", "");

        let xml = template.getCompiled(xmlt, [], defaults);

        let signer = new Signer(sign_credentials);
        let signature = signer.sign(xml, SIGN_MODE.GET_SIGNATURE); 
        let xml_signed = signer.sign(xml, SIGN_MODE.SIGN_REQUEST); 

        this.authrequest = {
            RequestID: requestID,
            Message: (protocolBinding==BINDING_POST)? xml_signed : xml,
            Destination: destination,
            ProtocolBinding: protocolBinding,
            SAMLRequest: (protocolBinding==BINDING_POST)? Utility.encodeSAMLRequest(xml_signed, true) : Utility.encodeSAMLRequest(xml),
            SigAlg: encodeURIComponent(sign_credentials.signatureAlgorithm),
            Signature: base64url(signature),

            // if there is no RelayState value, the entire parameter should be omitted 
            // from the signature computation (and not included as an empty parameter name)
            // SPID requires RelayState present
            RelayState: 'state'
        }

        console.log(this.authrequest);
    }

}

module.exports = Test_2_10_6