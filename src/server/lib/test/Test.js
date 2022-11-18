const moment = require('moment');

class Test {

    exec() {
        if(!this.hook) throw new Error("Test must have a hook");
        if(!this.num) throw new Error("Test must have a num");
        if(!this.description) throw new Error("Test must have a description");
        if(!this.validation) throw new Error("Test must have a validation");
        if(!(['automatic','self','required'].includes(this.validation))) throw new Error("Test must have a validation");
        if(!this.exec) throw new Error("Test must have a exec method");
    }

    setSuccess() { this.result = "success"; return this.result; }
    setWarning() { this.result = "warning"; return this.result; }
    setFailure() { this.result = "failure"; return this.result; }
}

module.exports = Test 