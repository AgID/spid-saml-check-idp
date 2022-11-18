const Test = require('./Test.js');
const moment = require('moment');

class TestAuthRequest extends Test {

    constructor(metadata, authrequest={}) {
        super();
        this.hook = "authentication-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
    }

    exec() {
        super.exec();
    }

    async getResult() {
        let test = {
            num: this.num,
            hook: this.hook,
            description: this.description,
            validation: this.validation,
            result: this.setFailure(),
            message: "",
            notes: "",
            datetime: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        if(this.validation=='self') {
            test.result = this.setWarning();
            test.message = "REQUIRES SELF ASSESSMENT";
            test.notes = this.notes;
            return test;
        } 

        if(this.validation=='required') {
            test.result = this.setWarning();
            test.message = "REQUIRES AUTHORITY ASSESSMENT";
            test.notes = this.notes;
            return test;
        } 

        try {
            //do not await here but exec requested. TODO 
            this.exec();
            test.result = this.setSuccess();
            test.message = "SUCCESS";
        } catch(error) {
            test.result = this.setFailure();
            test.message = error;
        } finally {
            test.notes = this.notes;
        }

        return test;
    }

    async getAuthRequest() {
        await this.exec();
        return this.authrequest;
    }
}

module.exports = TestAuthRequest 