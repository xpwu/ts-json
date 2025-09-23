import {Json, JsonHas, JsonKey} from ".."
import {ClassArray} from ".."


class A {
  a: number = 10
  c: string|null = "this is a string"
}

test("normal", ()=>{
  let ret = new Json().toJson(new A())
  expect(ret).toBe(`{"a":10,"c":"this is a string"}`)

  let jsn = `{"a":15,"c":"it's ok"}`
  let [a,err] = new Json().fromJson(jsn, A)
  expect(a.a).toBe(15)
  expect(a.c).toBe(`it's ok`)
  expect(a).toBeInstanceOf(A)
  expect(err).toBeNull()
})

class Msg {
  id: string = ""
  content: string = "this is a content"
  sender: string = ""
  aa: A = new A()
  as: A[] = new ClassArray(A)
  array: string[] = []

  public getSender():string {
    return this.id + this.sender
  }
}

test("class-array", ()=>{
  let msg = new Msg()
  msg.id = "1234567890"
  msg.sender = "fromC"
  msg.aa.a = 20

  /* ret =
  {
    "id":"1234567890",
    "content":"this is a content",
    "sender":"fromC",
    "aa":{
      "a":20,
      "c":"this is a string"
    },
    "as":[],
    "array":[]
  }
  */
  let ret = new Json().toJson(msg)
  expect(ret).toBe(`{"id":"1234567890","content":"this is a content","sender":"fromC","aa":{"a":20,"c":"this is a string"},"as":[],"array":[]}`)

  let [m, err] = new Json().fromJson(ret, Msg)
  expect(err).toBeNull()
  expect(m.getSender()).toBe("1234567890fromC")
})

test("null", ()=>{
  let a = new A()
  a.c = null

  // {"a":10}
  let ret = new Json().toJson(a)
  expect(ret).toBe(`{"a":10}`)

  // {"a":10,"c":null}
  ret = new Json().allowNull().toJson(a)
  expect(ret).toBe(`{"a":10,"c":null}`)

  // {"a":10}
  ret = new Json().ignoreNull().toJson(a)
  expect(ret).toBe(`{"a":10}`)

  let str = `{"a":10,"c":null}`

  let [, err1] = new Json().fromJson(str, A)
  expect(err1?.message).toBe(`A.c---can not null`)

  let [ins, err] = new Json().allowNull().fromJson(str, A)
  expect(err).toBeNull()
  expect(ins.c).toBeNull()

  let [ins1, err2] = new Json().ignoreNull().fromJson(str, A)
  expect(err2).toBeNull()
  expect(ins1.c).toBe("this is a string")
})

class TestJsonKey {
  @JsonKey("f")
  f1: string = "f1"
  f2: number = 9
  @JsonKey("-")
  f3: boolean = true
}

test("key", ()=>{
  let ret = new Json().toJson(new TestJsonKey())
  expect(ret).toBe(`{"f":"f1","f2":9}`)

  let [ins, err] = new Json().fromJson(`{"f":"f","f2":9, "f3":false}`, TestJsonKey)
  expect(err).toBeNull()
  expect(ins.f1).toBe("f")
  expect(ins.f3).toBe(true)
})

test("has", ()=>{

  let [ins, err] = new Json().fromJson(`{"f":"f", "f3":false}`, TestJsonKey)
  expect(err).toBeNull()
  expect(ins.f1).toBe("f")
  expect(ins.f3).toBe(true)
  let has = JsonHas(ins)
  expect(has.f1).toBe(true)
  expect(has.f2).toBe(false)
  expect(has.f3).toBe(false)
})

