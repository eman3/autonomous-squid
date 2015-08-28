"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BUFFER_SIZE = 16 * 16 * 16 * 16 * 3 + 256;

var _require = require("uint4");

var readUInt4LE = _require.readUInt4LE;
var writeUInt4LE = _require.writeUInt4LE;

var exists = function exists(val) {
    return val !== undefined;
};

var getArrayPosition = function getArrayPosition(x, y, z) {
    var n = y >> 4;
    y = y % 16;
    return n * 4096 + y * 256 + z * 16 + x;
};

var getBlockCursor = function getBlockCursor(x, y, z) {
    return getArrayPosition(x, y, z) * 2 + 0;
};

var getBlockLightCursor = function getBlockLightCursor(x, y, z) {
    return getArrayPosition(x, y, z) * 0.5 + 131072;
};

var getSkyLightCursor = function getSkyLightCursor(x, y, z) {
    return getArrayPosition(x, y, z) * 0.5 + 163840;
};

var getBiomeCursor = function getBiomeCursor(x, y, z) {
    return 16 * 16 * 16 * 16 * 3 + z * 16 + x; // X and Z may need to be flipped
};

var Chunk = (function () {
    function Chunk() {
        _classCallCheck(this, Chunk);

        this.data = new Buffer(BUFFER_SIZE);
        this.data.fill(0);
    }

    _createClass(Chunk, {
        getBlock: {
            value: function getBlock(x, y, z) {
                return {
                    id: this.getBlockType(x, y, z),
                    data: this.getBlockData(x, y, z),
                    light: {
                        sky: this.getSkyLight(x, y, z),
                        block: this.getBlockLight(x, y, z)
                    },
                    biome: this.getBiome(x, y, z)
                };
            }
        },
        setBlock: {
            value: function setBlock(x, y, z, block) {
                if (exists(block.id)) this.setBlockType(x, y, z, block.id);
                if (exists(block.data)) this.setBlockData(x, y, z, block.data);
                if (exists(block.biome)) this.setBiome(x, y, z, block.biome);
                if (!exists(block.light)) {
                    return;
                }if (exists(block.light.sky)) this.setSkyLight(x, y, z, block.light.sky);
                if (exists(block.light.block)) this.setBlockLight(x, y, z, block.light.block);
            }
        },
        getBlockType: {
            value: function getBlockType(x, y, z) {
                var cursor = getBlockCursor(x, y, z);
                return this.data.readUInt16LE(cursor) >> 4;
            }
        },
        getBlockData: {
            value: function getBlockData(x, y, z) {
                var cursor = getBlockCursor(x, y, z);
                return this.data.readUInt16LE(cursor) & 15;
            }
        },
        getBlockLight: {
            value: function getBlockLight(x, y, z) {
                var cursor = getBlockLightCursor(x, y, z);
                return readUInt4LE(this.data, cursor);
            }
        },
        getSkyLight: {
            value: function getSkyLight(x, y, z) {
                var cursor = getSkyLightCursor(x, y, z);
                return readUInt4LE(this.data, cursor);
            }
        },
        getBiome: {
            value: function getBiome(x, y, z) {
                var cursor = getBiomeCursor(x, y, z);
                return this.data.readUInt8(cursor);
            }
        },
        setBlockType: {
            value: function setBlockType(x, y, z, id) {
                var cursor = getBlockCursor(x, y, z);
                var data = this.getBlockData(x, y, z);
                this.data.writeUInt16LE(id << 4 | data, cursor);
            }
        },
        setBlockData: {
            value: function setBlockData(x, y, z, data) {
                var cursor = getBlockCursor(x, y, z);
                var id = this.getBlockType(x, y, z);
                this.data.writeUInt16LE(id << 4 | data, cursor);
            }
        },
        setBlockLight: {
            value: function setBlockLight(x, y, z, light) {
                var cursor = getBlockLightCursor(x, y, z);;
                writeUInt4LE(this.data, light, cursor);
            }
        },
        setSkyLight: {
            value: function setSkyLight(x, y, z, light) {
                var cursor = getSkyLightCursor(x, y, z);
                writeUInt4LE(this.data, light, cursor);
            }
        },
        setBiome: {
            value: function setBiome(x, y, z, biome) {
                var cursor = getBiomeCursor(x, y, z);
                this.data.writeUInt8(biome, cursor);
            }
        },
        dump: {
            value: function dump() {
                return this.data;
            }
        },
        load: {
            value: function load(data) {
                if (!Buffer.isBuffer(data)) throw new Error("Data must be a buffer");
                if (data.length != BUFFER_SIZE) throw new Error("Data buffer not correct size (was " + data.size() + ", expected " + BUFFER_SIZE + ")");
                this.data = data;
            }
        }
    });

    return Chunk;
})();

module.exports = Chunk;