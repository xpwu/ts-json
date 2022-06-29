
export type JsonPrimitive = number|string|boolean

export type JsonObject = {[key:string]:JsonType}

export type JsonArray = JsonType[]

export type JsonType = JsonPrimitive|JsonObject|JsonArray|null

export function isJsonArray(arg: JsonType): arg is JsonArray {
  return arg !== null && typeof arg === "object" && arg instanceof Array
}

export function isJsonObject(arg: JsonType) : arg is JsonObject {
  return arg !== null && typeof arg === "object" && !(arg instanceof Array)
}

export function isJsonObjectArray(arg: JsonType): arg is JsonObject[] {
  return  isJsonArray(arg) && arg.length === 1 && isJsonObject(arg[0])
}

export function isJsonPrimitive(arg: JsonType): arg is JsonPrimitive {
  return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean"
}

export function isEmptyJsonArray(arg: JsonType): arg is [] {
  return isJsonArray(arg) && arg.length == 0
}

export function isJsonPrimitiveArray(arg: JsonType): arg is JsonPrimitive[] {
  return isJsonArray(arg) && arg.length !== 0 && isJsonPrimitive(arg[0])
}

type Item<Type> = Type extends Array<infer Item> ? Item : never;

type Primitive = number|null|string|symbol|boolean

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

type RecursionCheck<T> = ExtractClass<T> extends PropertyMustNullable<ExtractClass<T>> ? T : never

type ExtractClass<T> = Exclude<Flatten<T>, Primitive>

type IsFunction<T> = T extends (...args: any)=>any? true : false

type CheckProperty<T> = null extends T? (Flatten<T> extends Primitive? T : RecursionCheck<T>) : never

export type PropertyMustNullable<T> = {
  [P in keyof T]: IsFunction<T[P]> extends true? T[P] : CheckProperty<T[P]>
}

export type Nullable<T> = { [P in keyof T]: T[P]|null }



// class C {
//   c1: number|null = 0
// }
//
// class D {
//   c1: number = 0
// }
//
// class A {
//   a:null|string = ""
//   c:number|null = 0
//
//   e:number[]|null = []
//
//   d:symbol|null = Symbol()
//
//   x:C|null = null
//
//   y:Nullable<D>|null = null
//
//   static c:number
//
//   getA(): null {
//     return null
//   }
//
//   getC(c:number): null {
//     return null
//   }
//
//   getD(c:number, abc:string, efg:string): null {
//     return null
//   }
//
//   se = ()=> {
//   }
// }