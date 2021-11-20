const JSDOMEnvironment = require("jest-environment-jsdom");
const idlUtils = require("jsdom/lib/jsdom/living/generated/utils.js");

class JSDOMEnvironmentExt extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    // https://github.com/jsdom/jsdom/issues/2555
    this.dom.window.Blob.prototype.arrayBuffer = async function () {
      return idlUtils.implForWrapper(this)._buffer.buffer;
    };
  }
}

module.exports = JSDOMEnvironmentExt;
