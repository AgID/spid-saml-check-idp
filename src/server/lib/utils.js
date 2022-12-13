const url = require("url");
const path = require("path");
const zlib = require('zlib');
const flatted = require("flatted");
const child_process = require('child_process');
const UUID = require("uuidjs");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const validator = require("validator");
const fs = require("fs-extra");
const crypto = require("crypto");


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.normalize = function() {
    var target = this;
    return target.replace(/[^a-z0-9]/gi, "_").toLowerCase().trim();
}

class Utils {

    static log(tag, text) {
        console.log("\n\n>>> " + tag);
        if(text!=null) console.log(flatted.stringify(text));
    }

    static defaultParam(params, key, defaultVal) {
        let val = params.filter((p)=> { return (p.key==key) })[0];
        if(val==null) params.push({"key": key, "val": defaultVal});
        return params;
    }

    static getUUID() {
        // NCName type (https://github.com/italia/spid-saml-check/issues/14)
        return "_" + UUID.generate();
    }

    static getNonce() {
        return UUID.genV4().hexNoDelim;
    }

    static getInstant() {
        return moment().utc().format();
    }

    static getInstantMillis() {
        return moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    static getNotBefore(instant) {
        return moment(instant).utc().format();
    }

    static getNotOnOrAfter(instant) {
        return moment(instant).add(5, 'm').utc().format();
    }

    static encrypt(toencrypt, key) {
        return CryptoJS.AES.encrypt(toencrypt, key);
    }
        
    static decrypt(encrypted, key) {
        return CryptoJS.AES.decrypt(encrypted.toString(), key);
    }

    static btoa(text) {
        return Buffer.from(text).toString('base64');
    }

    static atob(buffer) {
        return Buffer.from(buffer, 'base64').toString('ascii');
    }

    static encodeSAMLRequest(xml, post=false) {
        let samlRequest = null
        if(post) {
            samlRequest = new Buffer(xml).toString('base64')
        } else {
            samlRequest = zlib.deflateRawSync(xml).toString("base64");
        }
        return samlRequest;
    }

    // patch to validator.isJWT for JWE compatibility
    // move to validator.isJWT when PR will be merged 
    // https://github.com/validatorjs/validator.js/pull/2031
    static isJWT(str, jwe = false) {
        let dotSplit = str.split('.');
        let len = dotSplit.length;
      
        if(!jwe) {
            if (len > 3 || len < 2) {
                return false;
            }
        } else {
            if (len < 5 || len > 5) {
                return false; 
            }
        }
      
        return dotSplit.reduce((acc, currElem) => acc && validator.isBase64(currElem, { urlSafe: true }), true);
    }


    static sign(data, key, alg = 'RSA-SHA256') {
        const signature = crypto.sign(alg, Buffer.from(data), key);
        return signature.toString('base64');
    }

    static verify(data, signature, crt, alg = 'RSA-SHA256') {
        const verify = crypto.verify(alg, Buffer.from(data), crt, Buffer.from(signature, 'base64'));
        return verify;
    }
}

module.exports = Utils;
