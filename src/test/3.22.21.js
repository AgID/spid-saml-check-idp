const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const Utils = require('../server/lib/utils.js');
const validator = require('../server/node_modules/validator');
const path = require("path");
const fs = require("fs");
const jose = require('../server/node_modules/node-jose');
const moment = require('../server/node_modules/moment');

class Test_3_22_21 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.22.21";
        this.description = "GrantToken JWS (Grant Token Inner Signed Token) - claim act MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        let Extensions = this.authresponse.Extensions;

        if(Extensions==null || Extensions.GrantedAttributeAuthority==null) {
            this.notes = Extensions;
            throw("Extension GrantedAttributeAuthority is not present");
        }
        
        if(Extensions!=null && Extensions.GrantedAttributeAuthority!=null 
            && Extensions.GrantedAttributeAuthority.length==0) {
            this.notes = Extensions;
            throw("Element GrantedAttributeAuthority does not contains any GrantToken elements");
        }

        let grant_tokens = [];
        
        for(let t in Extensions.GrantedAttributeAuthority[0]) {
            let grantToken = Extensions.GrantedAttributeAuthority[0][t];
            if(grantToken.GrantToken==null || grantToken.GrantToken=='') {
                this.notes = grantToken;
                throw("GrantToken does not have a value");
            }        

            if(!Utils.isJWT(grantToken.GrantToken, true)) {
                this.notes = grantToken.GrantToken;
                throw("GrantToken is not a valid JWE");
            }

            const config_prv_aa_key = fs.readFileSync(path.resolve(__dirname, '../config/attribute-authority-private-enc.key'));
            const keystore = jose.JWK.createKeyStore();
            
            const prv_key = await keystore.add(config_prv_aa_key, 'pem');
            let jwe = await jose.JWE.createDecrypt(prv_key).decrypt(grantToken.GrantToken);

            let grantTokenInnerSignedToken = jwe.payload.toString();

            if(!Utils.isJWT(grantTokenInnerSignedToken)) {
                this.notes = grantTokenInnerSignedToken;
                throw("GrantToken JWE payload is not a valid JWS (Grant Token Inner Signed Token)");
            }

            // TODO: grab public key from idp metadata in config store
            const config_pub_idp_key = fs.readFileSync(path.resolve(__dirname, '../config/idp-public-sig.crt'));
            
            const pub_crt = await keystore.add(config_pub_idp_key, 'pem');
            let jws = await jose.JWS.createVerify(pub_crt).verify(grantTokenInnerSignedToken);

            let grantTokenInnerSignedTokenPayload = JSON.parse(jws.payload.toString());

            if(grantTokenInnerSignedTokenPayload.act==null || grantTokenInnerSignedTokenPayload.act=='') {
                this.notes = grantTokenInnerSignedTokenPayload.act;
                throw("GrantToken JWS (Grant Token Inner Signed Token) claim act is not present");
            }
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_22_21