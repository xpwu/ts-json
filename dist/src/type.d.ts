import { JsonDecoder, RawJson } from "./coder";
export type JsonPrimitive = number | string | boolean;
export type JsonObject = {
    [key: string]: JsonType;
};
export type JsonArray = JsonType[];
export type JsonType = JsonPrimitive | JsonObject | JsonArray | null;
export declare function isJsonArray(arg: JsonType): arg is JsonArray;
export declare function isJsonObject(arg: JsonType): arg is JsonObject;
export declare function isJsonObjectArray(arg: JsonType): arg is JsonObject[];
export declare function isJsonPrimitive(arg: JsonType): arg is JsonPrimitive;
export declare function isJsonEmptyArray(arg: JsonType): arg is [];
export declare function isJsonPrimitiveArray(arg: JsonType): arg is JsonPrimitive[];
export type Item<Type> = Type extends Array<infer Item> ? Item : never;
type Primitive = number | null | string | symbol | boolean;
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
type RecursionCheck<T, Exclude> = ExtractClass<T> extends PropertyMustNullable<ExtractClass<T>, Exclude> ? T : never;
type ExtractClass<T> = Exclude<Flatten<T>, Primitive>;
type IsFunction<T> = T extends (...args: any) => any ? true : false;
type CheckProperty<T, Exclude> = null extends T ? (Flatten<T> extends Primitive | JsonType | JsonDecoder ? T : RecursionCheck<T, Exclude>) : (T extends Exclude ? T : never);
export type PropertyMustNullable<T, Exclude = never> = {
    [P in keyof T]: IsFunction<T[P]> extends true ? T[P] : CheckProperty<T[P], Exclude>;
};
export type ProNullable<T> = {
    [P in keyof T]: T[P] extends JsonType | RawJson ? T[P] | null : ProNullable<T[P]> | null;
};
export declare function asNonNull<T>(arg: T): NonNullable<T>;
export {};
//# sourceMappingURL=type.d.ts.map