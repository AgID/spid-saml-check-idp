const fs = require('fs');
const UUID = require("uuidjs");
const sqlite3 = require('better-sqlite3');
const moment = require('moment');
const utility = require('./utils.js');
const config_test = require("../../config/test.json");
const dbfile = "data/database.sqlite";

 
class Database {

    constructor() {

    }

    connect() {
        this.db = new sqlite3(dbfile, { verbose: (text)=> {
            utility.log("DATABASE : QUERY", (text.replaceAll('\\s+', ' ')));
        }});
        return this;
    }

    close() {
        if(!this.db) { utility.log("DATABASE", "Error: DB null."); return -1; }
        this.db.close();
    }

    checkdb() {
        let me = this;
        let exists = fs.existsSync(dbfile);
        if(!me || !me.db || !exists) {
            me = this.connect().setup();
        }

        if(!me.db) { utility.log("DATABASE", "Error: DB null."); return false; }            
        return me;
    }

    setup() {
        if(!this.checkdb()) return;

        try { 
            this.db.exec(" \
                CREATE TABLE IF NOT EXISTS log ( \
                    timestamp   DATETIME DEFAULT (datetime('now', 'localtime')) NOT NULL, \
                    type        STRING,   \
                    text        STRING (1024) \
                ); \
                CREATE TABLE IF NOT EXISTS store ( \
                    user                        STRING UNIQUE, \
                    organization                INTEGER, \
                    issuer                      STRING, \
                    external_code               STRING UNIQUE, \
                    timestamp                   DATETIME, \
                    type                        STRING, \
                    store                       TEXT, \
                    PRIMARY KEY (user, type)     \
                ); \
                CREATE TABLE IF NOT EXISTS request ( \
                    req_id          INTEGER PRIMARY KEY AUTOINCREMENT, \
                    req_timestamp   DATETIME DEFAULT (datetime('now')) NOT NULL, \
                    code            STRING UNIQUE, \
                    state           STRING, \
                    user            STRING, \
                    type            STRING, \
                    testsuite       STRING, \
                    testcase        STRING, \
                    authrequest     STRING \
                ); \
            ");

            this.db.exec(" \
                DELETE FROM log WHERE timestamp <= datetime('now', '-60 minutes'); \
            ");

        } catch(exception) {
            utility.log("DATABASE already exists. Skip database creation.", exception);
        }
        return this;
    }

    select(sql) {
        if(!this.checkdb()) return;
        
        let result = [];
        try { 
            result = this.db.prepare(sql).all();
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (select)", exception.toString());
        }
        return result;
    }

    log(tag, text) {
        if(!this.checkdb()) return;

        let sql = "INSERT INTO log(timestamp, type, text) VALUES (DATETIME('now', 'localtime'), ?, ?)";
        try { 
            result = this.db.prepare(sql).run(tag, text);
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (log)", exception.toString());;
        }
    }


    saveStore(user, organization, issuer, external_code, store_type, new_store) {
        if(!this.checkdb()) return;

        let sql1 = " \
            INSERT OR IGNORE INTO store(user, organization, issuer, external_code, timestamp, type, store) \
            VALUES (?, ?, ?, ?, DATETIME('now', 'localtime'), ?, ?);";
        let sql2 = "UPDATE store SET timestamp=DATETIME('now', 'localtime'), ";

        try { 
            let store = this.getStore(user, store_type);
            if(!store) store = {};

            for(let key in new_store) {
                store[key] = new_store[key];
            }

            let storeSerialized = JSON.stringify(store);

            let sql2_values = [];
            if(external_code!=null && external_code!='') {
                sql2 += "external_code=?, ";
                sql2_values.push(external_code);
            }
            if(organization!=null && organization!='') {
                sql2 += "organization=?, ";
                sql2_values.push(organization);
            } 
            if(issuer!=null && issuer!='') {
                sql2 += "issuer=?, ";
                sql2_values.push(issuer);
            } 
            sql2 += "store=? WHERE user=? AND type=?";
            sql2_values.push(storeSerialized);
            sql2_values.push(user);
            sql2_values.push(store_type);
           
            this.db.prepare(sql1).run(user, organization, issuer, external_code, store_type, storeSerialized);
            this.db.prepare(sql2).run(...sql2_values);

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (saveStore)", exception.toString());
            throw(exception);
        } 
    }

    getOrganization(user, store_type) {
        if(!this.checkdb()) return;

        try {
            let data = false;
            let sql = this.db.prepare("SELECT organization FROM store WHERE user=? AND type=?");
            let result = sql.all(user, store_type);
            if(result.length==1) data = result[0].organization;
            return data; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getOrganization)", exception.toString());
            throw(exception);
        }
    }

    getStore(user, store_type) {
        if(!this.checkdb()) return;

        try {
            let sql_query = "SELECT store, type FROM store WHERE user=? ";

            let multiple_store_type = store_type.indexOf(',')!=-1;
            let store_type_value;
            if(multiple_store_type) {
                store_type = store_type.replaceAll(' ', '');
                let store_types = store_type.split(',');
                sql_query += " AND type IN('" + store_types.join("', '") + "')";

            } else {
                sql_query += " AND type='" + store_type + "'";
            }

            let sql = this.db.prepare(sql_query);
            let result = sql.all(user);
            
            let data = null;

            if(multiple_store_type) {
                if(result.length>0) {
                    data = [];
                    for(let row in result) {
                        let store = JSON.parse(result[row].store);
                        store.store_type = result[row].type;
                        data.push(store);
                    }
                }

            } else {
                if(result.length==1) {
                    data = JSON.parse(result[0].store);
                }
            }

            return data;

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getStore)", exception.toString());
            throw(exception);
        }
    }

    setMetadata(user, external_code, store_type, metadata) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);
        if(!store) store = {};
        store.metadata = metadata;

        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        if(!store.metadata.organization_name) throw new Error("organization_name is not found");
        if(!store.metadata.entity_id) throw new Error("entity_id is not found");

        let organization = metadata.organization_name;
        let issuer = metadata.entity_id; 
    
        this.saveStore(user, organization, issuer, external_code, store_type, store);
    }

    getMetadata(user, store_type) {
        if(!this.checkdb()) return;
        
        try {
            let metadata = false;
            let store = this.getStore(user, store_type);
            if(store) {
                metadata = store.metadata;
            }
            return metadata; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getMetadata)", exception.toString());
            throw(exception);
        }
    }

    setTest(user, external_code, store_type, testsuite, testcase, hook, test) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);

        if(!store) throw new Error("Store is not found");
        if(!store.metadata) throw new Error("Metadata is not found");
        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        if(!store.metadata.organization_name) throw new Error("organization_name is not found");
        if(!store.metadata.entity_id) throw new Error("entity_id is not found");

        if(!store.test) store.test = {};
        if(!store.test[testsuite]) {
            store.test[testsuite] = {
                description: config_test[testsuite].description,
                cases: {}
            };   
        }
  
        if(!store.test[testsuite]['cases'][testcase]) {
            store.test[testsuite]['cases'][testcase] = {};
        }

        if(!store.test[testsuite]['cases'][testcase]['hook']) {
            store.test[testsuite]['cases'][testcase]['hook'] = {};
        }

        if(!store.test[testsuite]['cases'][testcase]['hook'][hook]) {
            store.test[testsuite]['cases'][testcase]['hook'][hook] = {};
        }

        let store_hook = store.test[testsuite]['cases'][testcase]['hook'];

        // always update on the last check
        store.test[testsuite]['cases'][testcase] = {
            name: config_test[testsuite]['cases'][testcase].name,
            description: config_test[testsuite]['cases'][testcase].description,
            ref: config_test[testsuite]['cases'][testcase].ref,
            datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
            hook: store_hook
        };
        
        store.test[testsuite]['cases'][testcase]['hook'][hook][test.num] = test;

        let organization = store.metadata.organization_name;
        let issuer = store.metadata.entity_id;
    
        this.saveStore(user, organization, issuer, external_code, store_type, store);
    }

    setLastLog(user, external_code, store_type, testsuite, log) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);

        if(!store) throw new Error("Store is not found");
        if(!store.metadata) throw new Error("Metadata is not found");
        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        if(!store.metadata.organization_name) throw new Error("organization_name is not found");
        if(!store.metadata.entity_id) throw new Error("entity_id is not found");

        let organization = store.metadata.organization_name;
        let issuer = store.metadata.entity_id;

        store.test[testsuite]['lastlog'] = log;
        this.saveStore(user, organization, issuer, external_code, store_type, store);
    }

    getReport(user, store_type, testsuite) {
        if(!this.checkdb()) return;
        
        try {
            let report = {};
            let store = this.getStore(user, store_type);
            if(store) {
                report = store.test[testsuite];
            }
            return report; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getReport)", exception.toString());
            throw(exception);
        }
    }

    deleteStore(user, store_type) {
        if(!this.checkdb()) return;

        let sql = "DELETE FROM store WHERE user=? AND type=?";

        try { 
            this.db.prepare(sql).run(user, store_type);
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (deleteStore)", exception.toString());
            throw(exception);
        } 
    }



    /* --------- Web Browser SSO AuthnRequest Flow Helper ------------------- */

    saveRequest(code = UUID.generate(), state, user, store_type, testsuite, testcase, authrequest) {
        let stmt = this.db.prepare(" \
            INSERT INTO request(code, state, user, type, testsuite, testcase, authrequest) \
            VALUES(:code, :state, :user, :type, :testsuite, :testcase, :authrequest); \
        ");
        let info = stmt.run({
            'code': code,
            'state': state,
            'user': user,
            'type': store_type,
            'testsuite': testsuite,
            'testcase': testcase,
            'authrequest': JSON.stringify(authrequest)
        });
        let req_id = info.lastInsertRowid;
        return req_id;
    }

    getRequest(code) {
        let stmt = this.db.prepare(" \
            SELECT user, type, testsuite, testcase, authrequest, state FROM request \
            WHERE code = :code;"
        );

        let result = stmt.all({
            'code': code
        });

        let request = null;
        if(result.length==1) {
            request = {
                'user':         result[0]['user'],
                'type':         result[0]['type'],
                'testsuite':    result[0]['testsuite'],
                'testcase':     result[0]['testcase'],
                'authrequest':  JSON.parse(result[0]['authrequest']),
                'state':        result[0]['state']
            }
        }

        return request;
    }
}
    
module.exports = Database; 
