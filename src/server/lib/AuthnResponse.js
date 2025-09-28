const samlProtocol = require("./saml-protocol/protocol-bindings");
const errors = require("./saml-protocol/errors");
const namespaces = require("./saml-protocol/namespaces");
const signing = require("./saml-protocol/util/signing");
const credentials = require("./saml-protocol/util/credentials");
const Metadata = require("./saml-protocol/metadata.js");
const saml = require("./saml-protocol");

const xmldom = require("@xmldom/xmldom");
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

    getExtensions() {
        let extensions = undefined;
        let doc = new DOMParser().parseFromString(this.xml);
        let extensionsElements = select("//samlp:Response/samlp:Extensions", doc);
        if(extensionsElements.length) extensions = {};
        for(let i in extensionsElements) {
            let grantedAttributeAuthority = undefined;
            let grantedAttributeAuthorityElements = select("spid:GrantedAttributeAuthority", extensionsElements[i]);
            if(grantedAttributeAuthorityElements.length) grantedAttributeAuthority = [];
            for(let j in grantedAttributeAuthorityElements) {
                let grantToken = undefined;
                let grantTokenElements = select("GrantToken", grantedAttributeAuthorityElements[j]);
                if(grantTokenElements.length) grantToken = [];
                for(let k in grantTokenElements) {
                    let existsDestination = select("boolean(@Destination)", grantTokenElements[k]);
                    let grantTokenDestination = grantTokenElements[k].getAttribute("Destination");
                    let grantTokenValue = select("string()", grantTokenElements[k]);
                    grantToken.push({
                        Destination: existsDestination? grantTokenDestination : undefined,
                        GrantToken: grantTokenValue
                    });
                }
                if(grantToken) grantedAttributeAuthority.push(grantToken);
            }
            extensions['GrantedAttributeAuthority'] = grantedAttributeAuthority;
        }        
        return extensions; 
    }

    /*
    getExtensionGrantedAttributeAuthority() {
        let grantedAttributeAuthority = undefined;
        let doc = new DOMParser().parseFromString(this.xml);
        let grantToken = select("//samlp:Response/samlp:Extensions/spid:GrantedAttributeAuthority/GrantToken", doc);
        if(grantToken.length) grantedAttributeAuthority = [];
        for(let i in grantToken) {
            let grantTokenDestination = grantToken[i].getAttribute("Destination");
            let grantTokenValue = select("string()", grantToken[i]);
            grantedAttributeAuthority.push({
                Destination: grantTokenDestination,
                GrantToken: grantTokenValue
            });
        }        
        return grantedAttributeAuthority; 
    }
    */

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

    getResponseSignatureX509Certificate() {
        let doc = new DOMParser().parseFromString(this.xml);
        let x509 = select("string(//samlp:Response/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509Certificate)", doc);
        return "-----BEGIN CERTIFICATE-----\n" + x509 + "\n-----END CERTIFICATE-----";
    }

    getResponseSignatureDigestMethod() {
        let doc = new DOMParser().parseFromString(this.xml);
        let digestAlghoritm = select("//samlp:Response/ds:Signature/ds:SignedInfo/ds:Reference/ds:DigestMethod", doc)[0].getAttribute("Algorithm");
        switch(digestAlghoritm) {
            case "http://www.w3.org/2000/09/xmldsig#sha1": return "SHA1";
            case "http://www.w3.org/2001/04/xmlenc#sha256": return "SHA256";
            case "http://www.w3.org/2001/04/xmlenc#sha384": return "SHA3834";
            case "http://www.w3.org/2001/04/xmlenc#sha512": return "SHA512";
            case "http://www.w3.org/2001/04/xmlenc#ripemd160": return "RIPEMD-160";
            default: return "unknown";
        }
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