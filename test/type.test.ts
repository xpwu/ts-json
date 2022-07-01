import {JsonType, Nullable, PropertyMustNullable} from "../src"
import {isPrimitive, isPrimitiveArray} from "../src/class"
import {
  isJsonEmptyArray,
  isJsonArray,
  isJsonObject,
  isJsonObjectArray,
  isJsonPrimitive,
  isJsonPrimitiveArray
} from "../src/type"

class TypeCase {
  constructor(public value: JsonType, public isObject: boolean = false, public isArray: boolean = false
              , public isObjectArray: boolean = false, public isPrimitive: boolean = false
              , public isEmptyArray: boolean = false, public isPrimitiveArray: boolean = false) {
  }
}

test("json-type", ()=>{
  let newCase
  let cases : TypeCase[] = [
    new TypeCase({},true),
    new TypeCase({a:0, djkd:""},true),
    new TypeCase([], false, true, false, false, true),
    new TypeCase([1], false, true, false,
      false, false, true),
    new TypeCase([1,2,5,7], false, true, false,
      false, false, true),
    new TypeCase([{}], false, true, true,
      false, false, false),
    new TypeCase([{a:3939}], false, true, true,
      false, false, false),
    new TypeCase(2334, false, false, false,
      true, false, false),
    new TypeCase("efe0", false, false, false,
      true, false, false),
    new TypeCase(false, false, false, false,
      true, false, false),
    new TypeCase(true, false, false, false,
      true, false, false),
  ]

  for (let cs of cases) {
    const log = (ret: any) => {
      return `${JSON.stringify(cs.value)} : ${ret}`
    }

    expect(log(isJsonPrimitiveArray(cs.value))).toBe(log(cs.isPrimitiveArray))
    expect(log(isJsonPrimitive(cs.value))).toBe(log(cs.isPrimitive))
    expect(log(isJsonObject(cs.value))).toBe(log(cs.isObject))
    expect(log(isJsonObjectArray(cs.value))).toBe(log(cs.isObjectArray))
    expect(log(isJsonEmptyArray(cs.value))).toBe(log(cs.isEmptyArray))
    expect(log(isJsonArray(cs.value))).toBe(log(cs.isArray))
  }
})


class C {
  c1: number|null = 0
}

class D {
  c2: number = 0
}

class A {
  a:null|string = ""
  c:number|null = 0

  e:number[]|null = []

  d:symbol|null = Symbol()

  x:C|null = null

  y:Nullable<D>|null = null

  static c:number

  getA(): null {
    return null
  }

  getC(c:number): null {
    return null
  }

  getD(c:number, abc:string, efg:string): null {
    return null
  }

  se = ()=> {
  }
}

test("must-mull", ()=>{
  const t = <T extends PropertyMustNullable<T>>(a:T) => {}
  const f = ()=>{
    t(new A)
  }

  expect(f).not.toThrow()

})


