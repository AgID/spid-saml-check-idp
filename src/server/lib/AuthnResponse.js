const samlProtocol = require("./saml-protocol/protocol-bindings");
const errors = require("./saml-protocol/errors");
const namespaces = require("./saml-protocol/namespaces");
const signing = require("./saml-protocol/util/signing");
const credentials = require("./saml-protocol/util/credentials");
const Metadata = require("./saml-protocol/metadata.js");
const saml = require("./saml-protocol");

const xmldom = require("xmldom");
const xpath = require("xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


const SIGN_VALID_MODE = {
    RESPONSE: 0,
    ASSERTION: 1
}

class AuthnResponse {

    constructor(SAMLResponse) {
        if(SAMLResponse) {
            try {
                this.xml = samlProtocol.decodeXMLPayload(SAMLResponse);     
                console.log("SAMLResponse decoded", this.xml);       
            } catch(error) {
                console.log("Unable to decode AuthnResponse: " + error.message);
                throw new Error("Unable to decode AuthnResponse: " + error.message);
            }
        }
    }

    setMessage(xml) {
        this.xml = xml;
    }

    getMessage() {
        return this.xml;
    }

    getID() {
        let doc = new DOMParser().parseFromString(this.xml);
        let id = select("//samlp:Response", doc)[0].getAttribute("ID");
        return id;
    }

    getDestination() {
        let doc = new DOMParser().parseFromString(this.xml);
        let destination = select("//samlp:Response", doc)[0].getAttribute("Destination");
        return destination;
    }

    getInResponseTo() {
        let doc = new DOMParser().parseFromString(this.xml);
        let inResponseTo = select("//samlp:Response", doc)[0].getAttribute("InResponseTo");
        return inResponseTo;
    }

    getIssueInstant() {
        let doc = new DOMParser().parseFromString(this.xml);
        let issueInstant = select("//samlp:Response", doc)[0].getAttribute("IssueInstant");
        return issueInstant;
    }

    getIssuer() {
        let doc = new DOMParser().parseFromString(this.xml);
        let issuer = select("string(//samlp:Response/saml:Issuer)", doc);
        return issuer;
    }

    getStatus() {
        let doc = new DOMParser().parseFromString(this.xml);
        let statusCode = select("//samlp:Response/samlp:Status/samlp:StatusCode", doc)[0].getAttribute("Value");
        return {
            StatusCode: statusCode
        };
    }

    getAssertion_Issuer() {
        let doc = new DOMParser().parseFromString(this.xml);
        let assertionIssuer = select("string(//samlp:Response/saml:Assertion/saml:Issuer)", doc);
        return assertionIssuer;
    }

    getAssertion_InResponseTo() {
        let doc = new DOMParser().parseFromString(this.xml);
        let inResponseTo = select("//samlp:Response/saml:Assertion/saml:Subject/saml:SubjectConfirmation/saml:SubjectConfirmationData", doc)[0].getAttribute("InResponseTo");
        return inResponseTo;
    }

    getAssertion_AuthnContextClassRef() {
        let doc = new DOMParser().parseFromString(this.xml);
        let assertionIssuer = select("string(//samlp:Response/saml:Assertion/saml:AuthnStatement/saml:AuthnContext/saml:AuthnContextClassRef)", doc);
        return assertionIssuer;
    }

    getAssertion_AttributeStatement() {
        let attribute = [];
        let doc = new DOMParser().parseFromString(this.xml);
        let att = select("//samlp:Response/saml:Assertion/saml:AttributeStatement/saml:Attribute", doc);
        for(let i in att) {
            let attributeName = att[i].getAttribute("Name");
            let attributeValue = select("string(saml:AttributeValue)", att[i]);
            attribute.push({
                Name: attributeName,
                Value: attributeValue
            });
        }
        return attribute;
    }

    getAssertion() {
        return {
            Issuer: this.getAssertion_Issuer(),
            Subject: {
                SubjectConfirmation: {
                    SubjectConfirmationData: {
                        InResponseTo: this.getAssertion_InResponseTo()
                    }
                }
            },
            AuthnStatement: {
                AuthnContext: {
                    AuthnContextClassRef: this.getAssertion_AuthnContextClassRef()
                }
            },
            AttributeStatement: this.getAssertion_AttributeStatement()
        }
    }

    getSignatures() {
        let doc = new DOMParser().parseFromString(this.xml);
        let signatures = select("//ds:Signature", doc);
        return signatures;
    }

    getResponseSignature() {
        let doc = new DOMParser().parseFromString(this.xml);
        let signature = select("//samlp:Response/ds:Signature", doc)[0];
        return signature;
    }

    getAssertionSignature() {
        let doc = new DOMParser().parseFromString(this.xml);
        let signature = select("//samlp:Response/saml:Assertion/ds:Signature", doc)[0];
        return signature;
    }

    validateSignature(metadata, mode=SIGN_VALID_MODE.ASSERTION) {
        let valid = false;
        let error = ["Unable to validate signature"];

        let idp = Metadata.getIDPFromMetadata(metadata);
        let certs = credentials.getCredentialsFromEntity(idp, "signing");

        if(mode!=SIGN_VALID_MODE.RESPONSE 
            && mode!=SIGN_VALID_MODE.ASSERTION) {
            throw("mode MUST be SIGN_VALID_MODE.RESPONSE or SIGN_VALID_MODE.ASSERTION");
        }

        let signature = this.getAssertionSignature();

        if(mode==SIGN_VALID_MODE.RESPONSE) signature = this.getResponseSignature();

        if(signature==null) throw("Signature element not found");

        for(let c in certs) {
            let cert = certs[c];
            let err = signing.validateXMLSignature(this.xml, signature, cert);
            if(!err) valid = true;
            else error.push(err);
        }

        if(valid) return true;
        else throw(error.toString());
    }
}

module.exports.AuthnResponse = AuthnResponse;
module.exports.SIGN_VALID_MODE = SIGN_VALID_MODE;