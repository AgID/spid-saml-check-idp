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


class MetadataIdP {

    constructor(xml) {
        this.metadata = {
            xml: xml
        }
    }

    EntityId() {
        let doc = new DOMParser().parseFromString(this.metadata.xml);
        let identityProviderEntityId = select("//md:EntityDescriptor", doc)[0].getAttribute("entityID");
        return identityProviderEntityId;
    }

    SingleSignOnService(binding=null) {
        let singleSignOnService = [];
        let doc = new DOMParser().parseFromString(this.metadata.xml);
        let sso = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:SingleSignOnService", doc);
        for(let i in sso) {
            let ssoBinding = sso[i].getAttribute("Binding");
            let ssoLocation = sso[i].getAttribute("Location");
            
            if(ssoBinding=='urn:oasis:names:tc:SAML:2.0:bindings:' + binding) {
                return ssoLocation;

            } else {
                singleSignOnService.push({
                    Binding: ssoBinding,
                    Location: ssoLocation
                });
            }
        }

        return singleSignOnService;
    }

    SingleLogoutService() {
        let singleLogoutService = [];
        let doc = new DOMParser().parseFromString(this.metadata.xml);
        let slo = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:SingleLogoutService", doc);
        for(let i in slo) {
            let sloBinding = slo[i].getAttribute("Binding");
            let sloLocation = slo[i].getAttribute("Location");
            singleLogoutService.push({
                Binding: sloBinding,
                Location: sloLocation
            });
        }
        return singleLogoutService;
    }

    Attribute() {
        let attribute = [];
        let doc = new DOMParser().parseFromString(this.metadata.xml);
        let att = select("//md:EntityDescriptor/md:IDPSSODescriptor/md:Attribute", doc);
        for(let i in att) {
            let attName = att[i].getAttribute("Name");
            let attFriendlyName = att[i].getAttribute("FriendlyName");
            attribute.push({
                Name: attName,
                FriendlyName: attFriendlyName
            });
        }
        return attribute;
    }

    Organization() {
        let organization = {
            name: "",
            displayName: "",
            url: ""   
        };

        let doc = new DOMParser().parseFromString(this.metadata.xml);

        let organization_name = select("//md:EntityDescriptor/md:Organization/md:OrganizationName", doc);
        if(organization_name && organization_name.length>0) {
            organization.name = select("string(//md:OrganizationName)", organization_name[0]);
            if(organization_name.length > 1) {
                for(let n in organization_name) {
                    let name = organization_name[n];
                    if(name.getAttribute("lang")=="it") {
                        organization.name = select("string(//)", name);
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
                        organization.displayName = select("string(//)", display_name);
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
                        organization.url = select("string(//)", url);
                    }
                }
            }
        }

        return organization;
    }
}

module.exports = MetadataIdP;