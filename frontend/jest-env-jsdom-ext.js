const JSDOMEnvironment = require("jest-environment-jsdom");
const idlUtils = require("jsdom/lib/jsdom/living/generated/utils.js");

function noop() {}

class JSDOMEnvironmentExt extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    // https://github.com/jsdom/jsdom/issues/2555
    this.dom.window.Blob.prototype.arrayBuffer = async function () {
      return idlUtils.implForWrapper(this)._buffer.buffer;
    };

    this.dom.window.matchMedia = function () {
      return {
        matches: false,
        addEventListener: noop,
        removeEventListener: noop,
      };
    };
  }
}

module.exports = JSDOMEnvironmentExt;
