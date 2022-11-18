const signing = require("./saml-protocol/util/signing");

const SIGN_MODE = {
    SIGN_REQUEST: 0,
    GET_SIGNATURE: 1
}


class Signer {
    constructor(signatureOptions) {
        this.signatureOptions = signatureOptions;
    }

    sign(xml, mode) {
        let signed = "";
        mode = (mode!=null)? mode : SIGN_MODE.SIGN_REQUEST;

        switch(mode) {
            case 0: 
                signed = this.singleSign(xml, "AuthnRequest"); 
                break;
            case 1: 
                signed = this.getSignature(xml); 
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
