const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');
const Utils = require('../server/lib/utils.js');
const path = require("path");
const fs = require("fs");
const jose = require('../server/node_modules/node-jose');

class Test_3_21_7 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "3.21.7";
        this.description = "GrantToken JWE - the payload MUST be a valid JWS (Grant Token Inner Signed Token)";
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

            if(!Utils.isJWT(jwe.payload.toString())) {
                this.notes = jwe.payload.toString();
                throw("GrantToken JWE payload is not a valid JWS (Grant Token Inner Signed Token)");
            }           
        }

        this.notes = Extensions;
        return true;        
    }

}

module.exports = Test_3_21_7