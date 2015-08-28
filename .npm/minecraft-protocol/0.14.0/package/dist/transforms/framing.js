"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _slicedToArray = require("babel-runtime/helpers/sliced-to-array")["default"];

var _require$varint = _slicedToArray(require("../datatypes/utils").varint, 3);

var readVarInt = _require$varint[0];
var writeVarInt = _require$varint[1];
var sizeOfVarInt = _require$varint[2];

var Transform = require("readable-stream").Transform;

module.exports.createSplitter = function () {
  return new Splitter();
};

module.exports.createFramer = function () {
  return new Framer();
};

var Framer = (function (_Transform) {
  function Framer() {
    _classCallCheck(this, Framer);

    _get(Object.getPrototypeOf(Framer.prototype), "constructor", this).call(this);
  }

  _inherits(Framer, _Transform);

  _createClass(Framer, [{
    key: "_transform",
    value: function _transform(chunk, enc, cb) {
      var buffer = new Buffer(sizeOfVarInt(chunk.length));
      writeVarInt(chunk.length, buffer, 0);
      this.push(buffer);
      this.push(chunk);
      return cb();
    }
  }]);

  return Framer;
})(Transform);

var Splitter = (function (_Transform2) {
  function Splitter() {
    _classCallCheck(this, Splitter);

    _get(Object.getPrototypeOf(Splitter.prototype), "constructor", this).call(this);
    this.buffer = new Buffer(0);
  }

  _inherits(Splitter, _Transform2);

  _createClass(Splitter, [{
    key: "_transform",
    value: function _transform(chunk, enc, cb) {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      var value, size, error;
      var offset = 0;

      var _ref = readVarInt(this.buffer, offset) || { error: "Not enough data" };

      value = _ref.value;
      size = _ref.size;
      error = _ref.error;

      while (!error && this.buffer.length >= offset + size + value) {
        this.push(this.buffer.slice(offset + size, offset + size + value));
        offset += size + value;

        var _ref2 = readVarInt(this.buffer, offset) || { error: "Not enough data" };

        value = _ref2.value;
        size = _ref2.size;
        error = _ref2.error;
      }
      this.buffer = this.buffer.slice(offset);
      return cb();
    }
  }]);

  return Splitter;
})(Transform);
//# sourceMappingURL=../maps/transforms/framing.js.map