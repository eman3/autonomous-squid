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

var zlib = require("zlib");
var Transform = require("readable-stream").Transform;

module.exports.createCompressor = function (threshold) {
  return new Compressor(threshold);
};

module.exports.createDecompressor = function (threshold) {
  return new Decompressor(threshold);
};

var Compressor = (function (_Transform) {
  function Compressor() {
    var compressionThreshold = arguments[0] === undefined ? -1 : arguments[0];

    _classCallCheck(this, Compressor);

    _get(Object.getPrototypeOf(Compressor.prototype), "constructor", this).call(this);
    this.compressionThreshold = compressionThreshold;
  }

  _inherits(Compressor, _Transform);

  _createClass(Compressor, [{
    key: "_transform",
    value: function _transform(chunk, enc, cb) {
      var _this = this;

      if (chunk.length >= this.compressionThreshold) {
        zlib.deflate(chunk, function (err, newChunk) {
          if (err) return cb(err);
          var buf = new Buffer(sizeOfVarInt(chunk.length) + newChunk.length);
          var offset = writeVarInt(chunk.length, buf, 0);
          newChunk.copy(buf, offset);
          _this.push(buf);
          return cb();
        });
      } else {
        var buf = new Buffer(sizeOfVarInt(0) + chunk.length);
        var offset = writeVarInt(0, buf, 0);
        chunk.copy(buf, offset);
        this.push(buf);
        return cb();
      }
    }
  }]);

  return Compressor;
})(Transform);

var Decompressor = (function (_Transform2) {
  function Decompressor() {
    var compressionThreshold = arguments[0] === undefined ? -1 : arguments[0];

    _classCallCheck(this, Decompressor);

    _get(Object.getPrototypeOf(Decompressor.prototype), "constructor", this).call(this);
    this.compressionThreshold = compressionThreshold;
  }

  _inherits(Decompressor, _Transform2);

  _createClass(Decompressor, [{
    key: "_transform",
    value: function _transform(chunk, enc, cb) {
      var _this2 = this;

      var size, value, error;

      var _readVarInt = readVarInt(chunk, 0);

      size = _readVarInt.size;
      value = _readVarInt.value;
      error = _readVarInt.error;

      if (error) return cb(error);
      if (value === 0) {
        this.push(chunk.slice(size));
        return cb();
      } else {
        zlib.inflate(chunk.slice(size), function (err, newBuf) {
          if (err) return cb(err);
          _this2.push(newBuf);
          return cb();
        });
      }
    }
  }]);

  return Decompressor;
})(Transform);
//# sourceMappingURL=../maps/transforms/compression.js.map