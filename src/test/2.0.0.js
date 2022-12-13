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

class Test_2_0_0 extends TestAuthRequest {
    
    constructor(metadata, authrequest={}) {
        super(metadata, authrequest);
        this.num = "2.0.0";
        this.description = "The AuthnRequest is valid for SPID Level 1. Binding: HTTP-Request";
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

        let protocolBinding = BINDING_REDIRECT;

        let metadata = new MetadataIDP(this.metadata.configuration);

        let requestID = Utility.getUUID();
        let destination = (protocolBinding==BINDING_POST)? metadata.getSingleSignOnService('HTTP-POST') : metadata.getSingleSignOnService('HTTP-Redirect');

        Utility.defaultParam(defaults, "RequestID", requestID);
        Utility.defaultParam(defaults, "IssueInstant", Utility.getInstant());
        Utility.defaultParam(defaults, "Destination", destination);
        Utility.defaultParam(defaults, "ForceAuthn", "true");
        Utility.defaultParam(defaults, "AssertionConsumerServiceURL", config_server.host + "/samlacs");
        // here is ProtocolBinding of desired response.
        // request MUST contain AttributeConsumingServiceIndex or AssertionConsumerServiceURL+ProtocolBinding
        Utility.defaultParam(defaults, "ProtocolBinding", BINDING_POST);
        Utility.defaultParam(defaults, "AttributeConsumingServiceIndex", "0");
        Utility.defaultParam(defaults, "IssuerNameQualifier", config_sp.entity_id);
        Utility.defaultParam(defaults, "IssuerFormat", "urn:oasis:names:tc:SAML:2.0:nameid-format:entity");
        Utility.defaultParam(defaults, "Issuer", config_sp.entity_id);
        Utility.defaultParam(defaults, "NameIDPolicyFormat", "urn:oasis:names:tc:SAML:2.0:nameid-format:transient");
        Utility.defaultParam(defaults, "Comparison", "minimum");
        Utility.defaultParam(defaults, "AuthnContextClassRef", "https://www.spid.gov.it/SpidL1");

        let xml = template.getCompiled(xmlt, [], defaults);

        let signer = new Signer(sign_credentials);
        let xml_signed = signer.sign(xml, SIGN_MODE.SIGN_REQUEST); 
        
        let samlRequest = (protocolBinding==BINDING_POST)? Utility.encodeSAMLRequest(xml_signed, true) : Utility.encodeSAMLRequest(xml);
        let relayState = 'state';
        let sigAlg = sign_credentials.signatureAlgorithm;

        let query = "SAMLRequest=" + encodeURIComponent(samlRequest) 
            + "&RelayState=" + encodeURIComponent(relayState)
            + "&SigAlg=" + encodeURIComponent(sigAlg);

        let signature = Utility.sign(query, sign_credentials.privateKey);

        this.authrequest = {
            RequestID: requestID,
            Message: (protocolBinding==BINDING_POST)? xml_signed : xml,
            Destination: destination,
            ProtocolBinding: protocolBinding,
            SAMLRequest: encodeURIComponent(samlRequest),
            SigAlg: encodeURIComponent(sigAlg),
            Signature: (protocolBinding==BINDING_REDIRECT)? encodeURIComponent(signature) : null,

            // if there is no RelayState value, the entire parameter should be omitted 
            // from the signature computation (and not included as an empty parameter name)
            // SPID requires RelayState present
            RelayState: encodeURIComponent(relayState)
        }

        console.log(this.authrequest);
    }

}

module.exports = Test_2_0_0 