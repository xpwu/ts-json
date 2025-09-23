import {ClassArray, Json, JsonKey, RawJson} from ".."
import {JsonHas} from ".."


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

class UserNonNull {
  id: string = ""
  name: string|null = null
  @JsonKey("addr")
  address: string = ""
  sex: number = 1
  age: number|null = null
  back: boolean|null = null
  sign: boolean = true
  img: RawJson = new RawJson()
  friends: string[]|null = null
  msgs: Msg[] = new ClassArray(Msg)
  msg2s: Msg[]|null = new ClassArray(Msg)
  m: Msg|null = new Msg()
}

test("json", ()=>{
  let tson = new Json()
  expect(tson.toJson(user)).toBe(json)

  let [instance, err] = tson.fromJson(json, User)
  expect(err).toBeNull()
  expect(instance).toEqual(user)

  let [instance2, err2] = tson.fromJson(json, UserNonNull)
  expect(err2).toBeNull()
  expect(instance2).toEqual(user)
})

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
      [, err] = tson.fromJson(cs.json, cs.prototype)
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
      [, err] = tson.fromJson(cs.json, cs.prototype)
    }catch (e) {
      expect(cs.json + " --- " + e).toBe("")
    }
    expect(err).toBeNull()
  }

})

class Null {
  a: number = 10
  c: string | null = ""
}

class Cons {
  constructor(public a:number, public c:string) {
  }
}

test("json-empty", ()=>{
  let [ret, err] = new Json().fromJson({}, Null)
  expect(err).toBeNull()
  expect(ret.a).toBe(10)
  expect(ret.c).toBe("")

  let has = JsonHas(ret)
  expect(has.c).toBe(false)
  expect(has.a).toBe(false)

  let [ret2, err2] = new Json().fromJson({}, Cons)
  expect(err2).toBeNull()
  expect(ret2.a).toBe(undefined)
  expect(ret2.c).toBe(undefined)

  let has2 = JsonHas(ret2)
  expect(has2.a).toBe(false)
  expect(has2.c).toBe(false)
})

class Ignore {
  a: string = "ok"
  @JsonKey("-")
  b: string = "should be ignore"
  c: number = 1
  d: boolean = false
}

test("json-ignore", ()=>{
  let json = new Json().toJson(new Ignore())
  expect(json).toEqual('{"a":"ok","c":1,"d":false}')
  let [ret, err] = new Json().fromJson('{"a":"ok","b":"test","c":1,"d":false}', Ignore)
  expect(err).toBeNull()
  expect(ret.b).toBe("should be ignore")

  let has = JsonHas(ret)
  expect(has.b).toBe(false)
  expect(has.a).toBe(true)
  expect(has.c).toBe(true)
  expect(has.d).toBe(true)
})


class NullValue {
  constructor(public a:string, public c:number) {
  }
}

test("test-null", ()=>{
  let [ret, err] = new Json().allowNull().fromJson({a:null}, NullValue)
  expect(err).toBeNull()
  expect(ret.a).toBe(null)
  expect(ret.c).toBe(undefined)

  let has = JsonHas(ret)
  expect(has.a).toBe(true)
  expect(has.c).toBe(false)
})

test("test-undefined", ()=>{
  let [ret, err] = new Json().fromJson({a:"ok", c:100}, NullValue)
  expect(err).toBeNull()
  expect(ret.a).toBe("ok")
  expect(ret.c).toBe(100)

  let has = JsonHas(ret)
  expect(has.a).toBe(true)
  expect(has.c).toBe(true)
})
