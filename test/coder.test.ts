import {JsonType, RawJson} from ".."
import {hasConstructorDecoder, hasConstructorEncoder, hasDecoder, hasEncoder} from "../dist/src/coder"


class ConstructorCoder {
  static decodeJson(_: JsonType): [any, Error|null] {
    return [null , null]
  }

  static encodeJson<T>(_: T): JsonType {
    return null
  }
}

test("coder", ()=>{
  let cc = new ConstructorCoder()
  let raw = new RawJson()

  expect(hasConstructorEncoder(cc.constructor)).toBe(true)
  expect(hasConstructorEncoder(raw.constructor)).toBe(false)
  expect(hasConstructorDecoder(cc.constructor)).toBe(true)
  expect(hasConstructorDecoder(raw.constructor)).toBe(false)

  expect(hasEncoder(cc)).toBe(false)
  expect(hasEncoder(raw)).toBe(true)
  expect(hasDecoder(cc)).toBe(false)
  expect(hasDecoder(raw)).toBe(true)
})
