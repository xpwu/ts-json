

import {
  canRecEmptyArray,
  Class, getArrayItemPrototype, isClass, isClassArray, isPrimitiveArray
} from "./class"
import {hasConstructorDecoder, hasConstructorEncoder, hasDecoder, hasEncoder} from "./coder"
import {
  isJsonEmptyArray,
  isJsonObject,
  isJsonObjectArray, isJsonPrimitiveArray,
  JsonObject,
  JsonType, ProNullable,
} from "./type"

const jsonToPropertySym: unique symbol = Symbol("from-json");
const propertyToJsonSym: unique symbol = Symbol("to-json");
const jsonDecoderSym:symbol = Symbol("json-decoder");
const jsonEncoderSym:symbol = Symbol("json-encoder");

type JsonToPropertyMap = Map<string, string|symbol>
type PropertyToJsonMap = Map<string|symbol, string>

interface ConverterMap {
  [jsonToPropertySym]?: JsonToPropertyMap
  [propertyToJsonSym]?: PropertyToJsonMap
}

// 清空原来的非对象(数组)值
// TODO: for in 目前查找的资料只是会遍历出可枚举的，同时查得对象的方法是不可枚举的，但是
// 这里出现了 for in 遍历出了对象的方法。（es5的浏览器环境出现此现象，其他编译方式与运行环境未验证）
// 所以这里加了“冗余”的条件判断
function getPropertyKeys<T extends object>(instance: T): (keyof T)[]{
  let keys:(keyof T)[] = []
  for (let p in instance) {
    if (instance.hasOwnProperty(p) && instance.propertyIsEnumerable(p)) {
      keys.push(p)
    }
  }
  return keys
}

function isPropertyKey<T extends object>(instance: T, key: string|symbol|number): key is keyof T {
  return instance.hasOwnProperty(key) && instance.propertyIsEnumerable(key)
}


export class Json {

  public toJson<T extends object>(instance: T): string {

    let to = this.class2json(instance);

    return JSON.stringify(to);
  }

  private class2json<T extends object>(from: T): JsonType {
    if (hasEncoder(from)) {
      return from.encodeJson()
    }
    if (hasConstructorEncoder(from.constructor)) {
      return from.constructor.encodeJson(from)
    }

    let property2jsonMap: PropertyToJsonMap = (from as ConverterMap)[propertyToJsonSym] || new Map();

    let to:{[key:string]:any} = {}

    for (let key of getPropertyKeys(from)) {
      let toKey = property2jsonMap.get(key as string|symbol) || key as string;
      let fromV = from[key]

      if (fromV === null) {
        continue
      }

      if (isClass<object>(fromV)) {
        to[toKey] = this.class2json(fromV);
        continue;
      }

      if (isClassArray(fromV)) {
        let arr: JsonType[] = []
        for (let item of fromV) {
          arr.push(this.class2json(item))
        }
        to[toKey] = arr
        continue
      }

      // 基本变量赋值
      to[toKey] = fromV;
    }

    return to
  }

  // <T extends Mull<T, Exclude>, Exclude = never>
  public fromJson<T extends {[P in keyof T]:T[P]}>(json: JsonObject|string
                                                   , prototype: Class<T>|T):[ProNullable<T>, null|Error] {
    if (typeof prototype === "function") {
      prototype = new prototype();
    }

    let jsonObj :JsonObject = json as JsonObject
    if (typeof json === "string") {
      let par = JSON.parse(json)
      if (par === null || typeof par !== "object" || par instanceof Array) {
        return [prototype, new Error("json string must be '{...}'")]
      }

      jsonObj = par
    }

    return this.json2class(jsonObj, prototype, prototype.constructor.name)
  }

  private json2class<T extends {[n:number]:any}>(from: JsonObject, prototype: T
                                        , className: string): [ProNullable<T>, null|Error] {

    if (hasDecoder(prototype)) {
      let err = prototype.decodeJson(from)
      return [prototype, err]
    }
    if (hasConstructorDecoder(prototype.constructor)) {
      return prototype.constructor.decodeJson(from)
    }

    let json2PropertyMap: JsonToPropertyMap = (prototype as ConverterMap)[jsonToPropertySym] || new Map();

    let hasSetKey = new Set<keyof typeof prototype>()

    for (let key of getPropertyKeys(from)) {
      let toKey = json2PropertyMap.get(key as string) || key;

      // class对象没有这项值，就跳过
      if (!isPropertyKey(prototype, toKey)) {
        continue
      }

      hasSetKey.add(toKey)

      if (from[key] === null) {
        prototype[toKey] = null
        continue
      }

      className = className + "." + toKey.toString()

      let fromV = from[key]
      let keyProto = prototype[toKey]

      let err = checkType(fromV, keyProto, className)
      if (err !== null) {
        return [prototype, err]
      }

      if (isJsonObjectArray(fromV) && isClassArray<{[key:number]:any}>(keyProto)) {
        let item = getArrayItemPrototype(keyProto)
        let retArr = new Array<typeof item>()
        for (let i = 0; i < fromV.length; ++i) {
          let [ret, err] = this.json2class(fromV[i], item, className + `[${i}]`)
          if (err !== null) {
            return [prototype, err]
          }
          retArr.push(ret)
        }

        prototype[toKey] = retArr
        continue
      }

      if (isJsonObject(fromV) && isClass<{[key:number]:any}>(keyProto)) {
        [prototype[toKey], err] = this.json2class(fromV, keyProto, className)
        if (err !== null) {
          return [prototype, err]
        }
        continue
      }

      prototype[toKey] = fromV
    }

    for (let key of getPropertyKeys(prototype)) {
      if (!hasSetKey.has(key)) {
        (prototype as ProNullable<typeof prototype>)[key] = null
      }
    }

    return [prototype, null]
  }
}

export function JsonKey(jsonKey:string, ...jsonKeys:string[]): PropertyDecorator {
  return (target: object, propertyKey: string|symbol) => {

    let targetSym = target as ConverterMap

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
  }
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
function checkType<T>(fromV: JsonType
  , property: T[keyof T]|null, className: string): Error|null {

  if (fromV === null) {
    return null
  }

  if (isJsonObject(fromV) /* {} */ && !isClass(property) /* not init by new XXX(...)*/) {
    return TypeError(`the json value is '{}', but the property of ${className} is not. 
        Please init the value with "new XXX(...)"`)
  }

  if (isJsonObjectArray(fromV) /* [{}] */ && !isClassArray(property) /* not init by new ClassArray*/){
    return TypeError(`the json value is '[{}]', but the property of ${className} is not. 
        Please init the value with "new ClassArray(clazz)"`)
  }
  // todo: check array element

  if (property === null) {
    return null
  }

  if (isJsonPrimitiveArray(fromV) && !isPrimitiveArray(property)) {
    return TypeError(`the json value is '[number|string|boolean]', but the property of ${className} is not. 
        Please init the value with "null or [xxx]"`)
  }
  // todo: check array element

  if (isJsonEmptyArray(fromV) && !canRecEmptyArray(property)) {
    return TypeError(`the json value is '[]', but the property of ${className} is not array type.`)
  }

  if (typeof fromV !== typeof property) {
    return TypeError(`the json value is "<${typeof fromV}>${fromV}", but the property of ${className} is '<${typeof property}>${property}'.
        Please init the value with "null or <${typeof fromV}>"`)
  }

  return null
}


