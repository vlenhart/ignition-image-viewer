var sizeof = function (variable) {
    var sizes = {
        Int8:    1,
        Uint8:   1,
        Int16:   2,
        Uint16:  2,
        Int32:   4,
        Uint32:  4,
        Float32: 4,
        Float64: 8
    };

    function getSizeRec (variable) {
        if(typeof(variable) == 'string') return sizes[variable];

        return variable.reduce(function (sum, v) {
            var size = getSizeRec(v.type);
            var length = v.length || 1;
            return sum + ( size * length );
        }, 0);
    };

    return getSizeRec(variable);
};

DataView.prototype.getStruct = function(struct, offset, littleEndian) {
    var view = this;

    var result = {};
    struct.forEach(function (structElement) {
        // lookup getter function
        var getter = function (offset, littleEndian) {
            if(typeof(structElement.type) == 'string') {
                var getFn = view['get' + structElement.type];
                return getFn.call(view, offset, littleEndian);
            } else {
                return view.getStruct(structElement.type, offset, littleEndian);
            }
        }
        // get size
        var size = sizeof(structElement.type);

        if(structElement.length) {
            // TODO: do it like this
            // var arrayType = window[structElement.type+'Array'];
            // debugger;
            // result[structElement.name] = new arrayType(view.buffer, offset, size);
            // // increment offset
            // offset += size;

            var values = [];
            for (var i=0; i<structElement.length; i++) {
                values[i] = getter(offset, littleEndian);
                offset += size;
            }
            // get multiple value
            result[structElement.name] = values;
        } else {
            // get single value
            result[structElement.name] = getter(offset, littleEndian);

            // increment offset
            offset += size;
        }

    });
    return result;
};
