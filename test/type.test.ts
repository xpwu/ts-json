import {JsonType} from "../src"

import {
  isJsonEmptyArray,
  isJsonArray,
  isJsonObject,
  isJsonObjectArray,
  isJsonPrimitive,
  isJsonPrimitiveArray, ProNullable, PropertyMustNullable
} from "../src/type"

class TypeCase {
  constructor(public value: JsonType, public isObject: boolean = false, public isArray: boolean = false
              , public isObjectArray: boolean = false, public isPrimitive: boolean = false
              , public isEmptyArray: boolean = false, public isPrimitiveArray: boolean = false) {
  }
}

test("json-type", ()=>{
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

  y:ProNullable<D>|null = null

  static c:number

  getA(): null {
    return null
  }

  getC(_:number): null {
    return null
  }

  getD(_1:number, _2:string, _3:string): null {
    return null
  }

  se = ()=> {
  }
}

test("must-mull", ()=>{
  const t = <T extends PropertyMustNullable<T>>(clazz: {new(...args:any[]): T}) => {return new clazz()}
  const f = ()=>{
    t(A)
  }

  expect(f).not.toThrow()
})

class E {
  e1:number|null = null
  e2:C = new C()
}

test("must-mull-exclude", ()=>{
  const t = <T extends PropertyMustNullable<T, Exclude>, Exclude = never>(clazz: {new(...args:any[]): T}) => {return new clazz()}
  const f = ()=>{
    t<E, C>(E)
  }

  expect(f).not.toThrow()
})

class Con {
  constructor(public a:string, public c:number) {
  }
}

function New<T>(con: {new (...args:any[]):T}):T {
  return new con()
}

test("test-con", ()=>{
  let con = New(Con)
  expect(con.a).toBe(undefined)
  expect(con.a).not.toBe(null)
  expect(con.a).not.toBe("")
  expect(!!con.a).not.toBeTruthy()
  expect(con.c).toBe(undefined)
  expect(con.c).not.toBe(null)
  expect(con.c).not.toBe(0)
  expect(!!con.c).not.toBeTruthy()
})


