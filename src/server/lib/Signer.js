const signing = require("./saml-protocol/util/signing");

const SIGN_MODE = {
    GET_SIGNATURE: 0,
    SIGN_METADATA: 1,
    SIGN_REQUEST: 2,
    SIGN_ASSERTION: 3
}


class Signer {
    constructor(signatureOptions) {
        this.signatureOptions = signatureOptions;
    }

    sign(xml, mode) {
        let signed = "";
        mode = (mode!=null)? mode : SIGN_MODE.SIGN_REQUEST;

        switch(mode) {
            case SIGN_MODE.GET_SIGNATURE:
                signed = this.getSignature(xml); 
                break;
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
    
    getSignature(xml) {
        let privateKey = this.signatureOptions.privateKey;
        let sigAlg = this.signatureOptions.signatureAlgorithm;
        return signing.createURLSignature(privateKey, xml, sigAlg);
    }
}



module.exports.Signer = Signer;
module.exports.SIGN_MODE = SIGN_MODE;
