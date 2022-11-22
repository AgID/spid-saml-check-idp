const Metadata = require("./saml-protocol/metadata.js");
const signing = require("./saml-protocol/util/signing");
const credentials = require("./saml-protocol/util/credentials");
const samlProtocol = require("./saml-protocol/protocol-bindings");
const errors = require("./saml-protocol/errors");
const namespaces = require("./saml-protocol/namespaces");
const saml = require("./saml-protocol");
const xmldom = require("xmldom");
const xpath = require("xpath");
const DOMParser = xmldom.DOMParser;
const select = xpath.useNamespaces({
    ...namespaces, 
    "spid": "https://spid.gov.it/saml-extensions"
}); 


class MetadataIDP {

    constructor(xml) {
        this.xml = xml;
    }

    getSignature() {
        let doc = new DOMParser().parseFromString(this.xml);
        let signature = select("//md:EntityDescriptor/ds:Signature", doc)[0];
        return signature;
    }

    getSignatureX509() {
        let doc = new DOMParser().parseFromString(this.xml);
        let signatureX509 = select("string(//md:EntityDescriptor/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509Certificate)", doc);
        signatureX509 = signatureX509.trim();
        return signatureX509;
    }

    getOrganizationName() {
        let doc = new DOMParser().parseFromString(this.xml);
        let OrganizationName = select("string(//md:EntityDescriptor/md:Organization/md:OrganizationName)", doc);
        OrganizationName = OrganizationName.trim();
        return OrganizationName;
    }

    getOrganizationDisplayName() {
        let doc = new DOMParser().parseFromString(this.xml);
        let OrganizationDisplayName = select("string(//md:EntityDescriptor/md:Organization/md:OrganizationDisplayName)", doc);
        OrganizationDisplayName = OrganizationDisplayName.trim();
        return OrganizationDisplayName;
    }

    getId() {
        let serviceProviderId = null;
        let doc = new DOMParser().parseFromString(this.xml);
        let entityDescriptor = select("//md:EntityDescriptor", doc);
        if(entityDescriptor && entityDescriptor.length==1)
        serviceProviderId = entityDescriptor[0].getAttribute("ID").trim();
        return serviceProviderId;
    }

    getEntityId() {
        let serviceProviderEntityId = null;
        let doc = new DOMParser().parseFromString(this.xml);
        let entityDescriptor = select("//md:EntityDescriptor", doc);
        if(entityDescriptor && entityDescriptor.length==1)
            serviceProviderEntityId = entityDescriptor[0].getAttribute("entityID").trim();
        return serviceProviderEntityId;
    }

    getSigningCertificateX509() {
        let signingCertificateX509 = [];
        let doc = new DOMParser().parseFromString(this.xml);
        let key = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:KeyDescriptor[@use='signing']/ds:KeyInfo/ds:X509Data", doc);
        for(let k in key) {
            let x509 = select("string(ds:X509Certificate)", key[k]);
            signingCertificateX509.push(x509.replace(/\s+/g, '').trim());
        }

        return signingCertificateX509;
    }

    getSingleSignOnService(binding=null) {
        let singleSignOnService = [];
        let doc = new DOMParser().parseFromString(this.xml);
        let sso = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:SingleSignOnService", doc);
        for(let i in sso) {
            let ssoBinding = sso[i].getAttribute("Binding");
            let ssoLocation = sso[i].getAttribute("Location");

            if(ssoBinding=='urn:oasis:names:tc:SAML:2.0:bindings:' + binding) {
                return ssoLocation;

            } else {
                singleSignOnService.push({
                    "Binding": ssoBinding.trim(),
                    "Location": ssoLocation.trim()
                });
            }
        }
        return singleSignOnService;
    }

    getSingleLogoutService() {
        let singleLogoutService = [];
        let doc = new DOMParser().parseFromString(this.xml);
        let slo = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:SingleLogoutService", doc);
        for(let i in slo) {
            let sloBinding = slo[i].getAttribute("Binding");
            let sloLocation = slo[i].getAttribute("Location");
            singleLogoutService.push({
                "Binding": sloBinding.trim(),
                "Location": sloLocation.trim()
            });
        }
        return singleLogoutService;
    }

    getAttribute() {
        let attribute = [];
        let doc = new DOMParser().parseFromString(this.xml);
        let att = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:Attribute", doc);
        for(let i in att) {
            let attName = att[i].getAttribute("Name");
            let attFriendlyName = att[i].getAttribute("FriendlyName");
            attribute.push({
                Name: attName.trim(),
                FriendlyName: attFriendlyName.trim()
            });
        }
        return attribute;
    }

    getOrganization() {
        let organization = {
            name: "",
            displayName: "",
            url: ""   
        };

        let doc = new DOMParser().parseFromString(this.xml);

        let organization_name = select("//md:EntityDescriptor/md:Organization/md:OrganizationName", doc);
        if(organization_name && organization_name.length>0) {
            organization.name = select("string(//md:OrganizationName)", organization_name[0]);
            if(organization_name.length > 1) {
                for(let n in organization_name) {
                    let name = organization_name[n];
                    if(name.getAttribute("lang")=="it") {
                        organization.name = select("string(//)", name).trim();
                    }
                }
            }
        }

        let organization_display_name = select("//md:EntityDescriptor/md:Organization/md:OrganizationDisplayName", doc);
        if(organization_display_name && organization_display_name.length>0) {
            organization.displayName = select("string(//md:OrganizationDisplayName)", organization_display_name[0]);
            if(organization_display_name.length > 1) {
                for(let n in organization_display_name) {
                    let display_name = organization_display_name[n];
                    if(display_name.getAttribute("lang")=="it") {
                        organization.displayName = select("string(//)", display_name).trim();
                    }
                }
            }
        }

        let organization_url = select("//md:EntityDescriptor/md:Organization/md:OrganizationURL", doc);
        if(organization_url && organization_url.length>0) {
            organization.url = select("string(//md:OrganizationURL)", organization_url[0]);
            if(organization_url.length > 1) {
                for(let n in organization_url) {
                    let url = organization_url[n];
                    if(url.getAttribute("lang")=="it") {
                        organization.url = select("string(//)", url).trim();
                    }
                }
            }
        }

        return organization;
    }

    getExtensions() {
        let extensions = {};
        let doc = new DOMParser().parseFromString(this.xml);

        // SupportedAuthnContextClassRefs
        let supported_acr = [];
        let supportedAuthnContextClassRefs = select("//md:EntityDescriptor/md:Extensions/spid:SupportedAuthnContextClassRefs/AuthnContextClassRef", doc);
        for(let i in supportedAuthnContextClassRefs) { 
            let acr = select("string(text())", supportedAuthnContextClassRefs[i]);            
            supported_acr.push(acr.trim());
        }

        // SupportedPurposes
        let supported_purpose = [];
        let supportedPurposes = select("//md:EntityDescriptor/md:Extensions/spid:SupportedPurposes/Purpose", doc);
        for(let i in supportedPurposes) { 
            let purpose = select("string(text())", supportedPurposes[i]);                  
            supported_purpose.push(purpose.trim());
        }

        extensions = {
            supported_acr: supported_acr,
            supported_purpose: supported_purpose
        }

        return extensions;
    }

    validateSignature() {
        let valid = false;
        let error = ["Unable to validate signature"];

        let idp = Metadata.getIDPFromMetadata(this.xml);
        let certs = credentials.getCredentialsFromEntity(idp, "signing");


        let signature = this.getSignature();

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

module.exports = MetadataIDP;