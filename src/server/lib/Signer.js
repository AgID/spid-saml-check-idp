const signing = require("./saml-protocol/util/signing");

const SIGN_MODE = {
    SIGN_METADATA: 1,
    SIGN_REQUEST: 2
}


class Signer {
    constructor(signatureOptions) {
        this.signatureOptions = signatureOptions;
    }

    sign(xml, mode) {
        let signed = "";
        mode = (mode!=null)? mode : SIGN_MODE.SIGN_REQUEST;

        switch(mode) {
            case SIGN_MODE.SIGN_METADATA: 
                signed = this.singleSign(xml, "EntityDescriptor")
                break;
            case SIGN_MODE.SIGN_REQUEST: 
                signed = this.singleSign(xml, "AuthnRequest"); 
                break;
        }
        return signed;
    }

    singleSign(xml, element) {
        let signed = "";
        
        try {
            signed = signing.signXML(
                xml, 
                {
                    reference: "//*[local-name(.)='" + element + "']/*[local-name(.)='Issuer']",
                    action: "after"
                },
                "//*[local-name(.)='" + element + "']",
                {
                    certificate: this.signatureOptions.certificate,
                    privateKey: this.signatureOptions.privateKey
                }, 
                {
                    signatureAlgorithm: this.signatureOptions.signatureAlgorithm
                }
            );
        } catch(exception) {
            signed = signing.signXML(
                xml, 
                {
                    reference: "//*[local-name(.)='" + element + "']",
                    action: "prepend"
                },
                "//*[local-name(.)='" + element + "']",
                {
                    certificate: this.signatureOptions.certificate,
                    privateKey: this.signatureOptions.privateKey
                }, 
                {
                    signatureAlgorithm: this.signatureOptions.signatureAlgorithm
                }
            );
        }

        return signed;    
    } 
}



module.exports.Signer = Signer;
module.exports.SIGN_MODE = SIGN_MODE;
