import { strtod } from '../live2dcubismframework';
import { csmMap } from '../type/csmmap';
import { csmString } from '../type/csmstring';
import { csmVector } from '../type/csmvector';
import { CubismLogInfo } from './cubismdebug';
const CSM_JSON_ERROR_TYPE_MISMATCH = 'Error: type mismatch';
const CSM_JSON_ERROR_INDEX_OF_BOUNDS = 'Error: index out of bounds';
export class Value {
    constructor() { }
    getRawString(defaultValue, indent) {
        return this.getString(defaultValue, indent);
    }
    toInt(defaultValue = 0) {
        return defaultValue;
    }
    toFloat(defaultValue = 0) {
        return defaultValue;
    }
    toBoolean(defaultValue = false) {
        return defaultValue;
    }
    getSize() {
        return 0;
    }
    getArray(defaultValue = null) {
        return defaultValue;
    }
    getVector(defaultValue = new csmVector()) {
        return defaultValue;
    }
    getMap(defaultValue) {
        return defaultValue;
    }
    getValueByIndex(index) {
        return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }
    getValueByString(s) {
        return Value.nullValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }
    getKeys() {
        return Value.dummyKeys;
    }
    isError() {
        return false;
    }
    isNull() {
        return false;
    }
    isBool() {
        return false;
    }
    isFloat() {
        return false;
    }
    isString() {
        return false;
    }
    isArray() {
        return false;
    }
    isMap() {
        return false;
    }
    equals(value) {
        return false;
    }
    isStatic() {
        return false;
    }
    setErrorNotForClientCall(errorStr) {
        return JsonError.errorValue;
    }
    static staticInitializeNotForClientCall() {
        JsonBoolean.trueValue = new JsonBoolean(true);
        JsonBoolean.falseValue = new JsonBoolean(false);
        Value.errorValue = new JsonError('ERROR', true);
        Value.nullValue = new JsonNullvalue();
        Value.dummyKeys = new csmVector();
    }
    static staticReleaseNotForClientCall() {
        JsonBoolean.trueValue = null;
        JsonBoolean.falseValue = null;
        Value.errorValue = null;
        Value.nullValue = null;
        Value.dummyKeys = null;
    }
}
export class CubismJson {
    constructor(buffer, length) {
        this._parseCallback = CubismJsonExtension.parseJsonObject;
        this._error = null;
        this._lineCount = 0;
        this._root = null;
        if (buffer != undefined) {
            this.parseBytes(buffer, length, this._parseCallback);
        }
    }
    static create(buffer, size) {
        const json = new CubismJson();
        const succeeded = json.parseBytes(buffer, size, json._parseCallback);
        if (!succeeded) {
            CubismJson.delete(json);
            return null;
        }
        else {
            return json;
        }
    }
    static delete(instance) {
        instance = null;
    }
    getRoot() {
        return this._root;
    }
    static arrayBufferToString(buffer) {
        const uint8Array = new Uint8Array(buffer);
        let str = '';
        for (let i = 0, len = uint8Array.length; i < len; ++i) {
            str += '%' + this.pad(uint8Array[i].toString(16));
        }
        str = decodeURIComponent(str);
        return str;
    }
    static pad(n) {
        return n.length < 2 ? '0' + n : n;
    }
    parseBytes(buffer, size, parseCallback) {
        const endPos = new Array(1);
        const decodeBuffer = CubismJson.arrayBufferToString(buffer);
        if (parseCallback == undefined) {
            this._root = this.parseValue(decodeBuffer, size, 0, endPos);
        }
        else {
            this._root = parseCallback(JSON.parse(decodeBuffer), new JsonMap());
        }
        if (this._error) {
            let strbuf = '\0';
            strbuf = 'Json parse error : @line ' + (this._lineCount + 1) + '\n';
            this._root = new JsonString(strbuf);
            CubismLogInfo('{0}', this._root.getRawString());
            return false;
        }
        else if (this._root == null) {
            this._root = new JsonError(new csmString(this._error), false);
            return false;
        }
        return true;
    }
    getParseError() {
        return this._error;
    }
    checkEndOfFile() {
        return this._root.getArray()[1].equals('EOF');
    }
    parseValue(buffer, length, begin, outEndPos) {
        if (this._error)
            return null;
        let o = null;
        let i = begin;
        let f;
        for (; i < length; i++) {
            const c = buffer[i];
            switch (c) {
                case '-':
                case '.':
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': {
                    const afterString = new Array(1);
                    f = strtod(buffer.slice(i), afterString);
                    outEndPos[0] = buffer.indexOf(afterString[0]);
                    return new JsonFloat(f);
                }
                case '"':
                    return new JsonString(this.parseString(buffer, length, i + 1, outEndPos));
                case '[':
                    o = this.parseArray(buffer, length, i + 1, outEndPos);
                    return o;
                case '{':
                    o = this.parseObject(buffer, length, i + 1, outEndPos);
                    return o;
                case 'n':
                    if (i + 3 < length) {
                        o = new JsonNullvalue();
                        outEndPos[0] = i + 4;
                    }
                    else {
                        this._error = 'parse null';
                    }
                    return o;
                case 't':
                    if (i + 3 < length) {
                        o = JsonBoolean.trueValue;
                        outEndPos[0] = i + 4;
                    }
                    else {
                        this._error = 'parse true';
                    }
                    return o;
                case 'f':
                    if (i + 4 < length) {
                        o = JsonBoolean.falseValue;
                        outEndPos[0] = i + 5;
                    }
                    else {
                        this._error = "illegal ',' position";
                    }
                    return o;
                case ',':
                    this._error = "illegal ',' position";
                    return null;
                case ']':
                    outEndPos[0] = i;
                    return null;
                case '\n':
                    this._lineCount++;
                case ' ':
                case '\t':
                case '\r':
                default:
                    break;
            }
        }
        this._error = 'illegal end of value';
        return null;
    }
    parseString(string, length, begin, outEndPos) {
        if (this._error) {
            return null;
        }
        if (!string) {
            this._error = 'string is null';
            return null;
        }
        let i = begin;
        let c, c2;
        const ret = new csmString('');
        let bufStart = begin;
        for (; i < length; i++) {
            c = string[i];
            switch (c) {
                case '"': {
                    outEndPos[0] = i + 1;
                    ret.append(string.slice(bufStart), i - bufStart);
                    return ret.s;
                }
                case '//': {
                    i++;
                    if (i - 1 > bufStart) {
                        ret.append(string.slice(bufStart), i - bufStart);
                    }
                    bufStart = i + 1;
                    if (i < length) {
                        c2 = string[i];
                        switch (c2) {
                            case '\\':
                                ret.expansion(1, '\\');
                                break;
                            case '"':
                                ret.expansion(1, '"');
                                break;
                            case '/':
                                ret.expansion(1, '/');
                                break;
                            case 'b':
                                ret.expansion(1, '\b');
                                break;
                            case 'f':
                                ret.expansion(1, '\f');
                                break;
                            case 'n':
                                ret.expansion(1, '\n');
                                break;
                            case 'r':
                                ret.expansion(1, '\r');
                                break;
                            case 't':
                                ret.expansion(1, '\t');
                                break;
                            case 'u':
                                this._error = 'parse string/unicord escape not supported';
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        this._error = 'parse string/escape error';
                    }
                }
                default: {
                    break;
                }
            }
        }
        this._error = 'parse string/illegal end';
        return null;
    }
    parseObject(buffer, length, begin, outEndPos) {
        if (this._error) {
            return null;
        }
        if (!buffer) {
            this._error = 'buffer is null';
            return null;
        }
        const ret = new JsonMap();
        let key = '';
        let i = begin;
        let c = '';
        const localRetEndPos2 = Array(1);
        let ok = false;
        for (; i < length; i++) {
            FOR_LOOP: for (; i < length; i++) {
                c = buffer[i];
                switch (c) {
                    case '"':
                        key = this.parseString(buffer, length, i + 1, localRetEndPos2);
                        if (this._error) {
                            return null;
                        }
                        i = localRetEndPos2[0];
                        ok = true;
                        break FOR_LOOP;
                    case '}':
                        outEndPos[0] = i + 1;
                        return ret;
                    case ':':
                        this._error = "illegal ':' position";
                        break;
                    case '\n':
                        this._lineCount++;
                    default:
                        break;
                }
            }
            if (!ok) {
                this._error = 'key not found';
                return null;
            }
            ok = false;
            FOR_LOOP2: for (; i < length; i++) {
                c = buffer[i];
                switch (c) {
                    case ':':
                        ok = true;
                        i++;
                        break FOR_LOOP2;
                    case '}':
                        this._error = "illegal '}' position";
                        break;
                    case '\n':
                        this._lineCount++;
                    default:
                        break;
                }
            }
            if (!ok) {
                this._error = "':' not found";
                return null;
            }
            const value = this.parseValue(buffer, length, i, localRetEndPos2);
            if (this._error) {
                return null;
            }
            i = localRetEndPos2[0];
            ret.put(key, value);
            FOR_LOOP3: for (; i < length; i++) {
                c = buffer[i];
                switch (c) {
                    case ',':
                        break FOR_LOOP3;
                    case '}':
                        outEndPos[0] = i + 1;
                        return ret;
                    case '\n':
                        this._lineCount++;
                    default:
                        break;
                }
            }
        }
        this._error = 'illegal end of perseObject';
        return null;
    }
    parseArray(buffer, length, begin, outEndPos) {
        if (this._error) {
            return null;
        }
        if (!buffer) {
            this._error = 'buffer is null';
            return null;
        }
        let ret = new JsonArray();
        let i = begin;
        let c;
        const localRetEndpos2 = new Array(1);
        for (; i < length; i++) {
            const value = this.parseValue(buffer, length, i, localRetEndpos2);
            if (this._error) {
                return null;
            }
            i = localRetEndpos2[0];
            if (value) {
                ret.add(value);
            }
            FOR_LOOP: for (; i < length; i++) {
                c = buffer[i];
                switch (c) {
                    case ',':
                        break FOR_LOOP;
                    case ']':
                        outEndPos[0] = i + 1;
                        return ret;
                    case '\n':
                        ++this._lineCount;
                    default:
                        break;
                }
            }
        }
        ret = void 0;
        this._error = 'illegal end of parseObject';
        return null;
    }
}
export class JsonFloat extends Value {
    constructor(v) {
        super();
        this._value = v;
    }
    isFloat() {
        return true;
    }
    getString(defaultValue, indent) {
        const strbuf = '\0';
        this._value = parseFloat(strbuf);
        this._stringBuffer = strbuf;
        return this._stringBuffer;
    }
    toInt(defaultValue = 0) {
        return parseInt(this._value.toString());
    }
    toFloat(defaultValue = 0.0) {
        return this._value;
    }
    equals(value) {
        if ('number' === typeof value) {
            if (Math.round(value)) {
                return false;
            }
            else {
                return value == this._value;
            }
        }
        return false;
    }
}
export class JsonBoolean extends Value {
    isBool() {
        return true;
    }
    toBoolean(defaultValue = false) {
        return this._boolValue;
    }
    getString(defaultValue, indent) {
        this._stringBuffer = this._boolValue ? 'true' : 'false';
        return this._stringBuffer;
    }
    equals(value) {
        if ('boolean' === typeof value) {
            return value == this._boolValue;
        }
        return false;
    }
    isStatic() {
        return true;
    }
    constructor(v) {
        super();
        this._boolValue = v;
    }
}
export class JsonString extends Value {
    constructor(s) {
        super();
        if ('string' === typeof s) {
            this._stringBuffer = s;
        }
        if (s instanceof csmString) {
            this._stringBuffer = s.s;
        }
    }
    isString() {
        return true;
    }
    getString(defaultValue, indent) {
        return this._stringBuffer;
    }
    equals(value) {
        if ('string' === typeof value) {
            return this._stringBuffer == value;
        }
        if (value instanceof csmString) {
            return this._stringBuffer == value.s;
        }
        return false;
    }
}
export class JsonError extends JsonString {
    isStatic() {
        return this._isStatic;
    }
    setErrorNotForClientCall(s) {
        this._stringBuffer = s;
        return this;
    }
    constructor(s, isStatic) {
        if ('string' === typeof s) {
            super(s);
        }
        else {
            super(s);
        }
        this._isStatic = isStatic;
    }
    isError() {
        return true;
    }
}
export class JsonNullvalue extends Value {
    isNull() {
        return true;
    }
    getString(defaultValue, indent) {
        return this._stringBuffer;
    }
    isStatic() {
        return true;
    }
    setErrorNotForClientCall(s) {
        this._stringBuffer = s;
        return JsonError.nullValue;
    }
    constructor() {
        super();
        this._stringBuffer = 'NullValue';
    }
}
export class JsonArray extends Value {
    constructor() {
        super();
        this._array = new csmVector();
    }
    release() {
        for (let ite = this._array.begin(); ite.notEqual(this._array.end()); ite.preIncrement()) {
            let v = ite.ptr();
            if (v && !v.isStatic()) {
                v = void 0;
                v = null;
            }
        }
    }
    isArray() {
        return true;
    }
    getValueByIndex(index) {
        if (index < 0 || this._array.getSize() <= index) {
            return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_INDEX_OF_BOUNDS);
        }
        const v = this._array.at(index);
        if (v == null) {
            return Value.nullValue;
        }
        return v;
    }
    getValueByString(s) {
        return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }
    getString(defaultValue, indent) {
        const stringBuffer = indent + '[\n';
        for (let ite = this._array.begin(); ite.notEqual(this._array.end()); ite.increment()) {
            const v = ite.ptr();
            this._stringBuffer += indent + '' + v.getString(indent + ' ') + '\n';
        }
        this._stringBuffer = stringBuffer + indent + ']\n';
        return this._stringBuffer;
    }
    add(v) {
        this._array.pushBack(v);
    }
    getVector(defaultValue = null) {
        return this._array;
    }
    getSize() {
        return this._array.getSize();
    }
}
export class JsonMap extends Value {
    constructor() {
        super();
        this._map = new csmMap();
    }
    release() {
        const ite = this._map.begin();
        while (ite.notEqual(this._map.end())) {
            let v = ite.ptr().second;
            if (v && !v.isStatic()) {
                v = void 0;
                v = null;
            }
            ite.preIncrement();
        }
    }
    isMap() {
        return true;
    }
    getValueByString(s) {
        if (s instanceof csmString) {
            const ret = this._map.getValue(s.s);
            if (ret == null) {
                return Value.nullValue;
            }
            return ret;
        }
        for (let iter = this._map.begin(); iter.notEqual(this._map.end()); iter.preIncrement()) {
            if (iter.ptr().first == s) {
                if (iter.ptr().second == null) {
                    return Value.nullValue;
                }
                return iter.ptr().second;
            }
        }
        return Value.nullValue;
    }
    getValueByIndex(index) {
        return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }
    getString(defaultValue, indent) {
        this._stringBuffer = indent + '{\n';
        const ite = this._map.begin();
        while (ite.notEqual(this._map.end())) {
            const key = ite.ptr().first;
            const v = ite.ptr().second;
            this._stringBuffer +=
                indent + ' ' + key + ' : ' + v.getString(indent + '   ') + ' \n';
            ite.preIncrement();
        }
        this._stringBuffer += indent + '}\n';
        return this._stringBuffer;
    }
    getMap(defaultValue) {
        return this._map;
    }
    put(key, v) {
        this._map.setValue(key, v);
    }
    getKeys() {
        if (!this._keys) {
            this._keys = new csmVector();
            const ite = this._map.begin();
            while (ite.notEqual(this._map.end())) {
                const key = ite.ptr().first;
                this._keys.pushBack(key);
                ite.preIncrement();
            }
        }
        return this._keys;
    }
    getSize() {
        return this._keys.getSize();
    }
}
import * as $ from './cubismjson';
import { CubismJsonExtension } from './cubismjsonextension';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismJson = $.CubismJson;
    Live2DCubismFramework.JsonArray = $.JsonArray;
    Live2DCubismFramework.JsonBoolean = $.JsonBoolean;
    Live2DCubismFramework.JsonError = $.JsonError;
    Live2DCubismFramework.JsonFloat = $.JsonFloat;
    Live2DCubismFramework.JsonMap = $.JsonMap;
    Live2DCubismFramework.JsonNullvalue = $.JsonNullvalue;
    Live2DCubismFramework.JsonString = $.JsonString;
    Live2DCubismFramework.Value = $.Value;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
