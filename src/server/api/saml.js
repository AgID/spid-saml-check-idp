const config_test = require("../../config/test.json");
 
module.exports = function(app, checkAuthorisation, database) {

    app.get("/api/saml/authrequest/:testcase", async function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.query.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let external_code = (authorisation=='API')? req.query.external_code : req.session.external_code;

        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : req.session.store.metadata;

        let testsuite = "saml-core";
        let hook = "authentication-request";

        let tests = config_test[testsuite].cases[testcase].hook[hook]; 
        let testcase_name = config_test[testsuite].cases[testcase].name;
        let testcase_description = config_test[testsuite].cases[testcase].description;
        let testcase_referements = config_test[testsuite].cases[testcase].ref;
        console.log("Test case name: " + testcase_name);
        console.log("Referements: " + testcase_referements);
        console.log("Test list to be executed: ", tests);

        let authrequest = {};
        let test = null;
        for(t in tests) {
            let TestAuthRequestClass = require("../../test/" + tests[t]);
            test = new TestAuthRequestClass(metadata, authrequest);
            if(test.hook==hook) {
                authrequest = await test.getAuthRequest();

                // save request
                database.saveRequest(authrequest.RequestID, authrequest.RelayState, user, store_type, testsuite, testcase, authrequest);

                // save single test to store
                result = await test.getResult();
                database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                console.log(result);
            }
        }

        console.log("AuthnRequest", authrequest);
        res.status(200).send(authrequest);
    });

    app.get("/api/saml/report", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
                
        // get report
        let testsuite = "saml-core";
        let report = database.getReport(user, store_type, testsuite);

        console.log("Report", report);
        if(!report || report=={}) {
            res.status(404).send();
        } else {
            res.status(200).send(report);
        }
    });

    app.patch("/api/saml/report/:testcase/:hook/:test", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let hook = req.params.hook;
        let test = req.params.test;
        let patch_data = req.body.data;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;
        
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
                
        // get report
        let testsuite = "saml-core";
        let report = database.getReport(user, store_type, testsuite);

        // get test and patch
        let saved_test = report['cases'][testcase]['hook'][hook][test];
        for(let p in patch_data) {
            saved_test[p] = patch_data[p]; 
        }
        database.setTest(user, external_code, store_type, testsuite, testcase, hook, saved_test);

        // retrieve new report
        report = database.getReport(user, store_type, testsuite);

        console.log("Report", report);
        if(!report || report=={}) {
            res.status(404).send();
        } else {
            res.status(200).send(report);
        }
    });
}
