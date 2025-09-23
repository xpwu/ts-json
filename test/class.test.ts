
import {canRecEmptyArray, isClass, isClassArray, isPrimitive, isPrimitiveArray} from "../dist/src/class"
import {ClassArray} from ".."

class DefaultConstructor {

}

class TypeCase {
  constructor(public value: any, public isObject: boolean = false, public isArray: boolean = false
    , public isObjectArray: boolean = false, public isPrimitive: boolean = false
    , public canRecEmptyArray: boolean = false, public isPrimitiveArray: boolean = false) {
  }
}

test("json-type", ()=>{
  let cases : TypeCase[] = [
    new TypeCase({},true),
    new TypeCase({a:0, djkd:""},true),
    new TypeCase([], false, true, false,
      false, true, true),
    new TypeCase([1], false, true, false,
      false, true, true),
    new TypeCase([1,2,5,7], false, true, false,
      false, true, true),
    new TypeCase(new ClassArray(DefaultConstructor), false, true, true,
      false, true, false),
    new TypeCase([{}], false, true, true,
      false, true, false),
    new TypeCase([{a:3939}], false, true, true,
      false, true, false),
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

    expect(log(isPrimitiveArray(cs.value))).toBe(log(cs.isPrimitiveArray))
    expect(log(isPrimitive(cs.value))).toBe(log(cs.isPrimitive))
    expect(log(isClass(cs.value))).toBe(log(cs.isObject))
    expect(log(isClassArray(cs.value))).toBe(log(cs.isObjectArray))
    expect(log(canRecEmptyArray(cs.value))).toBe(log(cs.canRecEmptyArray))
  }
})