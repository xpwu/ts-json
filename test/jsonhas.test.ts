import {Json, JsonHas, JsonHasAll} from "../src/json";


class User {
  name: string = "xp"
  age: number = 18
}

test("jsonhas-yes", ()=>{
  const json = {
    name: "xp1"
  }

  let [user, err] = new Json().fromJson(json, User)
  expect(err).toBeNull()
  expect(user.name).toBe("xp1")

  let has = JsonHas(user)
  expect(has.age).toBeFalsy()
  expect(has.name).toBeTruthy()
})


test("jsonhas-no", ()=>{
  let user = new User()
  let has = JsonHas(user)
  expect(has.name).toBeFalsy()
  expect(has.age).toBeFalsy()
})

class Request {
  user: User = new User()
  tools: string[] = ["phone"]
}

test("jsonhas-yes2", ()=>{
  const json = {
    user: {
      name: "xp1"
    },
    tools: ["mi"]
  }

  let [r, err] = new Json().fromJson(json, Request)
  expect(err).toBeNull()
  let has = JsonHas(r)
  expect(has.tools).toBeTruthy()
  expect(has.user).toBeTruthy()

  let has2 = JsonHas(r.user)
  expect(has2.name).toBeTruthy()
  expect(has2.age).toBeFalsy()
})

test("jsonhas-no2", ()=>{
  const r:Request = {
    user: {
      name: "xp1",
      age: 18
    },
    tools: ["mi"]
  }

  let has = JsonHas(r)
  expect(has.tools).toBeFalsy()
  expect(has.user).toBeFalsy()

  let has2 = JsonHas(r.user)
  expect(has2.name).toBeFalsy()
  expect(has2.age).toBeFalsy()
})


test("jsonhas-no-yes", ()=>{
  const r:Request = {
    user: new User(),
    tools: ["mi"]
  }

  const json = {
    name: "xp1"
  }

  let [usr, err] = new Json().fromJson(json, User)
  expect(err).toBeNull()
  let has = JsonHas(r)
  expect(has.tools).toBeFalsy()
  expect(has.user).toBeFalsy()

  r.user = usr

  let has2 = JsonHas(r.user)
  expect(has2.name).toBeTruthy()
  expect(has2.age).toBeFalsy()
})

test("jsonhas-all", ()=>{
  let user1 = new User()
  expect(JsonHasAll(user1)).toBeFalsy()

  const json1 = {
    name: "xp1"
  }
  let [user2, err] = new Json().fromJson(json1, User)
  expect(err).toBeNull()
  expect(JsonHasAll(user2)).toBeFalsy()
  expect(JsonHasAll(user2, "age")).toBeTruthy()
  expect(JsonHasAll(user2, "age", "name")).toBeTruthy()

  const json2 = {
    name: "xp1",
    age: 18
  }
  let [user3, err3] = new Json().fromJson(json2, User)
  expect(err3).toBeNull()
  expect(JsonHasAll(user3)).toBeTruthy()
})

