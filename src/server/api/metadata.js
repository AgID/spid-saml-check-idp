const fs = require('fs-extra');
const axios = require('axios');
const moment = require('moment');
const validator = require('validator');
const Utility = require('../lib/utils');
const MetadataIDP = require('../lib/MetadataIDP');
const config_dir = require('../../config/dir.json');
const config_test = require("../../config/test.json");

 
module.exports = function(app, checkAuthorisation, database) {
   
    // download metadata 
    app.post("//api/metadata/download", function(req, res) {
    
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	
    
        let url = req.body.url;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!url) { return res.status(500).send("Please insert a valid URL"); }
        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        axios.get(url)
        .then(function(response) {
            let configuration = response.data;
            Utility.log("metadata url", url);
             
            // validate
            let metadata = new MetadataIDP(configuration);
            let entity_id = metadata.getEntityId();
            let organization_name = metadata.getOrganization().name;

            // Organization not present - Quick Fix
            // TODO: code Organization into spid-saml-check validator metadata
            if(organization_name==null || organization_name=='') {
                organization_name = entity_id;
            }

            let metadata_obj = {
                url: url,
                configuration: configuration,
                organization_name: organization_name,
                entity_id: entity_id
            };

            console.log(metadata_obj);
            
            database.setMetadata(user, external_code, store_type, metadata_obj);
            req.session.store.metadata = metadata_obj;
            res.status(200).json(metadata_obj);
        })
        .catch(function(err) {
            Utility.log("ERR /api/metadata/download", err);
            res.status(500).send(err.toString());
        });
    });
    
    // execute test for metadata
    app.get("//api/metadata/check/:testcase", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : req.session.store.metadata;
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }
        console.log("metadata", metadata);

        let testsuite = "metadata";
        let hook = "metadata";

        let tests = config_test[testsuite].cases[testcase].hook[hook]; 
        let testcase_name = config_test[testsuite].cases[testcase].name;
        let testcase_description = config_test[testsuite].cases[testcase].description;
        let testcase_referements = config_test[testsuite].cases[testcase].ref;
        console.log("Test case name: " + testcase_name);
        console.log("Referements: " + testcase_referements);
        console.log("Test list to be executed: ", tests);

        let report = [];
        let report_datetime = moment().format("YYYY-MM-DD HH:mm:ss");
        for(t in tests) {
            let TestClass = require("../../test/" + tests[t]);
            let test = new TestClass(metadata);
            if(test.hook==hook) {
                let result = await test.getResult();
                
                // save single test to store
                database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);
    
                console.log(result);
                report.push(result);
            }
        }

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

    // return last validation from store
    app.get("//api/metadata/lastcheck/:testcase", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let store = database.getStore(user, store_type);
        
        let testsuite = "metadata";
        let hook = "metadata";

        // if the last validation not exists, reroute for check
        if(!store.test[testsuite]) {
            res.status(404).send();
            return;
        }

        let testcase_name = store.test[testsuite]['cases'][testcase].name;
        let testcase_description = store.test[testsuite]['cases'][testcase].description;
        let testcase_referements = store.test[testsuite]['cases'][testcase].ref;
        let report_datetime =  store.test[testsuite]['cases'][testcase].datetime;

        let report = [];
        let tests = store.test[testsuite]['cases'][testcase]['hook'][hook];
        for(t in tests) report.push(tests[t]);

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

    /*
    // delete metadata
    app.delete("//api/metadata", function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        if(authorisation=='API') {
            if(!req.query.user) { return res.status(400).send("Parameter user is missing"); }
            if(!req.query.store_type) { return res.status(400).send("Parameter store_type is missing"); }
            //if(!req.query.external_code) { return res.status(400).send("Parameter external_code is missing"); }

            try {
                database.deleteStore(req.query.user, req.query.entity_id, req.query.store_type);
                res.status(200).send();

            } catch(exception) {
                res.status(500).send("Si è verificato un errore durante la cancellazione del metadata: " + exception.toString());
            }

        } else {
            res.status(401).send("Unhautorized");
        }
        
    });
    */

    // set test for metadata
    app.patch("//api/metadata/:testcase/:test", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        let testcase = req.params.testcase;
        let test = req.params.test;
        let patch_data = req.body.data;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : req.session.store.metadata;
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }
        console.log("metadata", metadata);

        let store = database.getStore(user, store_type);

        let testsuite = "metadata";
        let hook = "metadata";

        // if the last validation not exists, reroute for check
        if(!store.test[testsuite]) {
            res.status(404).send();
            return;
        }

        // get test and patch
        let saved_test = store.test[testsuite]['cases'][testcase]['hook'][hook][test];
        for(let p in patch_data) {
            saved_test[p] = patch_data[p]; 
        }
        database.setTest(user, external_code, store_type, testsuite, testcase, hook, saved_test);

        // retrieve new testsuite data
        store = database.getStore(user, store_type);

        let testcase_name = store.test[testsuite]['cases'][testcase].name;
        let testcase_description = store.test[testsuite]['cases'][testcase].description;
        let testcase_referements = store.test[testsuite]['cases'][testcase].ref;
        let report_datetime =  store.test[testsuite]['cases'][testcase].datetime;

        let report = [];
        let tests = store.test[testsuite]['cases'][testcase]['hook'][hook];
        for(t in tests) report.push(tests[t]);

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

}