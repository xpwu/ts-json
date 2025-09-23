import { canRecEmptyArray, getArrayItemPrototype, isClass, isClassArray, isPrimitiveArray } from "./class";
import { hasConstructorDecoder, hasConstructorEncoder, hasDecoder, hasEncoder } from "./coder";
import { isJsonEmptyArray, isJsonObject, isJsonObjectArray, isJsonPrimitiveArray, } from "./type";
const jsonToPropertySym = Symbol("from-json");
const propertyToJsonSym = Symbol("to-json");
// 清空原来的非对象(数组)值
// TODO: for in 目前查找的资料只是会遍历出可枚举的，同时查得对象的方法是不可枚举的，但是
// 这里出现了 for in 遍历出了对象的方法。（es5的浏览器环境出现此现象，其他编译方式与运行环境未验证）
// 所以这里加了“冗余”的条件判断
function getPropertyKeys(instance) {
    let keys = [];
    for (let p in instance) {
        if (instance.hasOwnProperty(p) && instance.propertyIsEnumerable(p)) {
            keys.push(p);
        }
    }
    return keys;
}
function isPropertyKey(instance, key) {
    return instance.hasOwnProperty(key) && instance.propertyIsEnumerable(key);
}
const has = Symbol("has");
export function JsonHas(arg) {
    if (arg.hasOwnProperty(has)) {
        return arg[has];
    }
    // fromJson 返回的对象都已经设置了has
    // 对于不是 fromJson返回的对象，has 都返回 false
    let ret = {};
    for (let p in arg) {
        ret[p] = false;
    }
    Object.defineProperty(arg, has, { enumerable: false, value: ret, writable: false });
    return ret;
}
export function JsonHasAll(arg, ...exclude) {
    if (!arg.hasOwnProperty(has)) {
        return false;
    }
    let h = arg[has];
    for (let p in h) {
        if (h[p] == false && !exclude.includes(p)) {
            return false;
        }
    }
    return true;
}
export class Json {
    constructor() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return null; };
        this.disallowNull();
    }
    ignoreNull() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return null; };
        return this;
    }
    allowNull() {
        this.nullToJson = (p, key) => { p[key] = null; };
        this.fromNullJson = (p, key) => { p[key] = null; return null; };
        return this;
    }
    disallowNull() {
        this.nullToJson = (_, _2) => { };
        this.fromNullJson = (_, _2) => { return Error("can not null"); };
        return this;
    }
    toJson(instance) {
        let to = this.class2json(instance);
        return JSON.stringify(to);
    }
    toJsonType(instance) {
        return this.class2json(instance);
    }
    class2json(from) {
        if (hasEncoder(from)) {
            return from.encodeJson();
        }
        if (hasConstructorEncoder(from.constructor)) {
            return from.constructor.encodeJson(from);
        }
        let property2jsonMap = from[propertyToJsonSym] || new Map();
        let to = {};
        for (let key of getPropertyKeys(from)) {
            let toKey = property2jsonMap.get(key) || key;
            if (toKey === "-") {
                continue;
            }
            let fromV = from[key];
            if (fromV === undefined) {
                continue;
            }
            if (fromV === null) {
                this.nullToJson(to, toKey);
                continue;
            }
            if (isClass(fromV)) {
                to[toKey] = this.class2json(fromV);
                continue;
            }
            if (isClassArray(fromV)) {
                let arr = [];
                for (let item of fromV) {
                    arr.push(this.class2json(item));
                }
                to[toKey] = arr;
                continue;
            }
            // 基本变量赋值
            to[toKey] = fromV;
        }
        return to;
    }
    fromJson(json, prototype) {
        if (typeof prototype === "function") {
            prototype = new prototype();
        }
        if (hasDecoder(prototype)) {
            let err = prototype.decodeJson(json);
            return [prototype, err];
        }
        if (hasConstructorDecoder(prototype.constructor)) {
            return prototype.constructor.decodeJson(json);
        }
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        if (!isJsonObject(json)) {
            return [prototype, new Error(`${prototype.constructor.name} has not Decoder or ConstructorDecoder`
                    + "so, json must be an object {...} or an object string '{...}'")];
        }
        return this.json2class(json, prototype, prototype.constructor.name);
    }
    json2class(from, prototype, className) {
        if (hasDecoder(prototype)) {
            let err = prototype.decodeJson(from);
            return [prototype, err];
        }
        if (hasConstructorDecoder(prototype.constructor)) {
            return prototype.constructor.decodeJson(from);
        }
        let json2PropertyMap = prototype[jsonToPropertySym] || new Map();
        let property2jsonMap = prototype[propertyToJsonSym] || new Map();
        let hasSetKey = new Set();
        let hasValue = {};
        for (let key of getPropertyKeys(from)) {
            if (key === "-") {
                continue;
            }
            let toKey = json2PropertyMap.get(key) || key;
            if (property2jsonMap.get(toKey) === "-") {
                continue;
            }
            // class对象没有这项值，就跳过
            if (!isPropertyKey(prototype, toKey)) {
                continue;
            }
            hasSetKey.add(toKey);
            hasValue[toKey] = true;
            let propertyName = className + "." + toKey.toString();
            if (from[key] === null) {
                let err = this.fromNullJson(prototype, toKey);
                if (err) {
                    return [prototype, Error(propertyName + "---" + err.message)];
                }
                continue;
            }
            let fromV = from[key];
            let keyProto = prototype[toKey];
            let err = checkType(fromV, keyProto, propertyName);
            if (err !== null) {
                return [prototype, err];
            }
            if (isJsonObjectArray(fromV) && isClassArray(keyProto)) {
                let item = getArrayItemPrototype(keyProto);
                let retArr = new Array();
                for (let i = 0; i < fromV.length; ++i) {
                    let [ret, err] = this.json2class(fromV[i], item, propertyName + `[${i}]`);
                    if (err !== null) {
                        return [prototype, err];
                    }
                    retArr.push(ret);
                }
                prototype[toKey] = retArr;
                continue;
            }
            if (isJsonObject(fromV) && isClass(keyProto)) {
                [prototype[toKey], err] = this.json2class(fromV, keyProto, propertyName);
                if (err !== null) {
                    return [prototype, err];
                }
                continue;
            }
            prototype[toKey] = fromV;
        }
        for (let key of getPropertyKeys(prototype)) {
            if (!hasSetKey.has(key)) {
                // (prototype as ProNullable<typeof prototype>)[key] = null
                hasValue[key] = false;
            }
        }
        Object.defineProperty(prototype, has, { enumerable: false, value: hasValue, writable: false });
        return [prototype, null];
    }
}
// '-' : ignore
export function JsonKey(jsonKey, ...jsonKeys) {
    return (target, propertyKey) => {
        let targetSym = target;
        if (!targetSym[jsonToPropertySym]) {
            targetSym[jsonToPropertySym] = new Map();
        }
        targetSym[jsonToPropertySym].set(jsonKey, propertyKey);
        for (let key of jsonKeys) {
            targetSym[jsonToPropertySym].set(key, propertyKey);
        }
        if (!targetSym[propertyToJsonSym]) {
            targetSym[propertyToJsonSym] = new Map();
        }
        targetSym[propertyToJsonSym].set(propertyKey, jsonKey);
    };
}
/*
* todo:
* 普通的类
* 数组中的值的类型必须一致
* 数组中的值不能有null
* 不能有高维数组
* 数组中可以有类
*
* */
function checkType(fromV, property, className) {
    if (fromV === null) {
        return null;
    }
    if (isJsonObject(fromV) /* {} */ && !isClass(property) /* not init by new XXX(...)*/) {
        return TypeError(`the json value is '{}', but the property of ${className} is not. 
        Please init the value with "new XXX(...)"`);
    }
    if (isJsonObjectArray(fromV) /* [{}] */ && !isClassArray(property) /* not init by new ClassArray*/) {
        return TypeError(`the json value is '[{}]', but the property of ${className} is not. 
        Please init the value with "new ClassArray(clazz)"`);
    }
    // todo: check array element
    if (property === null || property === undefined) {
        return null;
    }
    if (isJsonPrimitiveArray(fromV) && !isPrimitiveArray(property)) {
        return TypeError(`the json value is '[number|string|boolean]', but the property of ${className} is not. 
        Please init the value with "null or [xxx]"`);
    }
    // todo: check array element
    if (isJsonEmptyArray(fromV) && !canRecEmptyArray(property)) {
        return TypeError(`the json value is '[]', but the property of ${className} is not array type.`);
    }
    if (typeof fromV !== typeof property) {
        return TypeError(`the json value is "<${typeof fromV}>${fromV}", but the property of ${className} is '<${typeof property}>${property}'.
        Please init the value with "null or <${typeof fromV}>"`);
    }
    return null;
}
//# sourceMappingURL=json.js.map