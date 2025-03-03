import {RawJson} from "../src/coder";
import {Json} from "../src/json";


class User {
  name: string = ""
  age: number = 0
}

class Request {
  token: string = ""
  data: RawJson = new RawJson()
}

enum Code {
  OK = 200,
  TokenExpireCode = 401
}

class Response {
  code: Code = Code.OK
  data: RawJson = new RawJson()
}

test("rawJson-encoder", ()=>{
  let user = new User()
  user.name = "xp"
  user.age = 18

  let userJson = new Json().toJsonType(user)

  let req = new Request()
  req.token = "valid token"
  req.data.raw = userJson

  let json = new Json().toJson(req)

  expect(json).toBe(`{"token":"valid token","data":{"name":"xp","age":18}}`)

  expect(JSON.parse(json)).toEqual({
    token: "valid token",
    data:{
      name: "xp",
      age: 18
    }
  })
})

test("rawJson-decoder", ()=>{

  const json = `{"code":200, "data":{"name":"xp", "age":18}}`
  expect(JSON.parse(json)).toEqual({
    code: Code.OK,
    data: {
      name: "xp",
      age: 18
    }
  })

  let res = new Json().fromJson(json, Response)
  expect(res[1]).toBeNull()
  expect(res[0].code).toBe(Code.OK)

  let user = new Json().fromJson(res[0].data.raw, User)
  expect(user[1]).toBeNull()
  expect(user[0]).toEqual({
    name: "xp",
    age: 18
  })
})

