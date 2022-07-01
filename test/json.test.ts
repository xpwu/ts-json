import {ClassArray, Json, JsonKey, Nullable, RawJson} from "../src"


class Msg {
  id: string|null = null
  content: string|null = null
  sender: string|null = ""
}

class User {
  id: string|null = ""
  name: string|null = null
  @JsonKey("addr")
  address: string|null = ""
  sex: number|null = 1
  age: number|null = null
  back: boolean|null = null
  sign: boolean|null = true
  img: RawJson|null = new RawJson()
  friends: string[]|null = null
  msgs: Msg[]|null = new ClassArray(Msg)
  msg2s: Msg[]|null = new ClassArray(Msg)
  m: Msg|null = new Msg()
}

let user = new User()
user.img!.raw = {n:"this is an img"}
user.id = "addff"
user.friends = ["a", "c"]
user.back = false
user.age = 18
user.name = "aboy"
user.address = "ccc"
user.msg2s = [new Msg()]
user.m!.id = "iu9jfdlss"

let json = "{\"id\":\"addff\",\"name\":\"aboy\",\"addr\":\"ccc\",\"sex\":1,\"age\":18,\"back\":false,\"sign\":true,\"img\":{\"n\":\"this is an img\"},\"friends\":[\"a\",\"c\"],\"msgs\":[],\"msg2s\":[{\"sender\":\"\"}],\"m\":{\"id\":\"iu9jfdlss\",\"sender\":\"\"}}"

test("json", ()=>{
  let tson = new Json()
  expect(tson.toJson(user)).toBe(json)
  let [instance, err] = tson.fromJson(json, User)
  expect(err).toBeNull()
  expect(instance).toEqual(user)
})


function nullable<T>(arg: T): Nullable<T> {
  return arg
}

class Cases {
  constructor(public json:string, public prototype:object) {
  }
}

test("json-type-err", ()=>{
  let cases: Cases[] = [
    new Cases('{"id":5}', {id:""}),
    new Cases('{"id":"5"}', {id:5}),
    new Cases('{"id":{}}', {id:""}),
    new Cases('{"id":{"i2":0}}', {id:{i2:false}}),
    new Cases('{"id":[{"a1":0}]}', {id:[]}),
    new Cases('{"id":[{}]}', {id:[]}),
  ]
  let tson = new Json()

  for (let cs of cases) {
    let err:any
    try {
      [, err] = tson.fromJson(cs.json, nullable(cs.prototype))
    }catch (e) {
      expect(cs.json + " --- " + e).toBe("")
    }
    expect(err).not.toBeNull()
    expect(err instanceof TypeError).toBe(true)
  }

})


test("json-type-ok", ()=>{
  let cases: Cases[] = [
    new Cases('{"id":[5]}', {id:[]}),
    new Cases('{"id":"5"}', {id:null}),
    new Cases('{"id":[{}]}', {id:[{}]}),
    new Cases('{"id":[{}]}', {id:new ClassArray({})}),
    new Cases('{"id":[]}', {id:new ClassArray({})}),
    new Cases('{"id":{"i2":0}}', {id:{i2:null}}),
    new Cases('{"id":[{"a1":0}]}', {id:[{a1:0, c3:""}]}),
  ]
  let tson = new Json()

  for (let cs of cases) {
    let err:any
    try {
      [, err] = tson.fromJson(cs.json, nullable(cs.prototype))
    }catch (e) {
      expect(cs.json + " --- " + e).toBe("")
    }
    expect(err).toBeNull()
  }

})
