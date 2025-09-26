const fs = require("fs");
const path = require("path");
const x509 = require("@peculiar/x509");
const moment = require('moment');
const Utility = require("../lib/utils");
const Template = require('../lib/test/Template.js');
const AuthnResponse = require('../lib/AuthnResponse.js').AuthnResponse;
const Signer = require('../lib/Signer.js').Signer;
const SIGN_MODE = require('../lib/Signer.js').SIGN_MODE;
const config_server = require("../../config/server.json");
const config_sp = require("../../config/sp.json");
const config_test = require("../../config/test.json");


module.exports = function(app, checkAuthorisation, database) {

    // get metadata
    app.get("/metadata.xml", function (req, res) {

        const key = fs.readFileSync(path.resolve(__dirname, '../../config/spid-saml-check-idp-sig.key'));
        const crt = fs.readFileSync(path.resolve(__dirname, '../../config/spid-saml-check-idp-sig.crt'));
        const x5c = new x509.X509Certificate(crt);

        const sign_credentials = {
            signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
            certificate: crt,
            privateKey: key
        };

        let acs_endpoint = config_server.host
            + (config_server.useProxy? '' : ":" + config_server.port)
            + "/samlacs";

        let slo_endpoint = config_server.host
            + (config_server.useProxy? '' : ":" + config_server.port)
            + "/samlslo";

        let defaults = [];
        Utility.defaultParam(defaults, "ID", Utility.getUUID());
        Utility.defaultParam(defaults, "entityID", config_sp.entity_id);
        Utility.defaultParam(defaults, "X509Certificate", x5c.toString("base64"));
        Utility.defaultParam(defaults, "SingleLogoutService", slo_endpoint);
        Utility.defaultParam(defaults, "AssertionConsumerService", acs_endpoint);
        
        let template = new Template(path.resolve(__dirname));
        let metadata = template.getCompiled("metadata", [], defaults);

        let signer = new Signer(sign_credentials);
        let signed = signer.sign(metadata, SIGN_MODE.SIGN_METADATA);

        res.set('Content-Type', 'text/xml');
        res.status(200).send(signed);
    });


    app.get("/samlacs", function (req, res) {
        res.send("SAML ACS HTTP-Redirect");
    });

    app.post("/samlacs", async function (req, res) {
        
        let report = [];
        let num_success = 0;
        let num_warning = 0;
        let num_failure = 0;

        let authresponse = req.body;
        console.log("AuthnResponse", authresponse);

        let user = req.session.user;
        let store_type = (req.session.store_type)? req.session.store_type : 'test';
        let organization = (req.session.entity)? req.session.entity.id : null;
        let external_code = req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = database.getMetadata(user, store_type);
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }

        console.log("Metadata", metadata);

        // parse AuthnResponse
        let samlResponse = new AuthnResponse(authresponse.SAMLResponse);

        authresponse.Message = samlResponse.getMessage();
        authresponse.ResponseID = samlResponse.getID();
        authresponse.InResponseTo = samlResponse.getInResponseTo();
        authresponse.Issuer = samlResponse.getIssuer();
        authresponse.Extensions = samlResponse.getExtensions();
        authresponse.Destination = samlResponse.getDestination();
        authresponse.Status = samlResponse.getStatus();
        authresponse.Assertion = samlResponse.getAssertion();

        // retrieve request
        let inResponseTo = authresponse.InResponseTo;
        if(inResponseTo==null) inResponseTo = '';

        let request = database.getRequest(inResponseTo);

        if(request==null) {
            request = {
                testsuite: 'saml-core',
                testcase: 'test-case-saml-core-0'
            }
        }

        let authrequest = request.authrequest;    
        console.log("Saved AuthnRequest", request);
        
        let testsuite = request.testsuite;
        let testcase = request.testcase;

        {   // authentication response
            let hook = "authentication-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestAuthResponseClass = require("../../test/" + tests[t]);
                    test = new TestAuthResponseClass(metadata, authrequest, authresponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }
        

        let summary_result = "";
        if(num_failure>0) {
            summary_result = "failure";
        } else if(num_warning>0) {
            summary_result = "warning";
        } else {
            summary_result = "success";
        }
        

        let log = {
            summary: {
                result: summary_result,
                num_success: num_success,
                num_warning: num_warning,
                num_failure: num_failure
            },
            //userinfo: userinfo_data,
            details: {
                metadata: metadata,
                authrequest: authrequest,
                authresponse: authresponse,
                report: report,
                report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        };

        // save log to store
        database.setLastLog(user, external_code, store_type, testsuite, log);

        res.status(200).json(log);
    });

    app.get("/samlslo", function (req, res) {
        res.send("SAML SLO HTTP-Redirect");
    });

    app.post("/samlslo", function (req, res) {
        res.send("SAML SLO HTTP-POST");
    });
    
}