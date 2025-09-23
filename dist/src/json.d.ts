import { JsonType } from "./type";
export type Has<T> = {
    [P in keyof T]: boolean;
};
export declare function JsonHas<T extends object>(arg: T): Has<T>;
export declare function JsonHasAll<T extends object>(arg: T, ...exclude: Extract<keyof T, string>[]): boolean;
export declare class Json {
    constructor();
    ignoreNull(): this;
    allowNull(): this;
    disallowNull(): this;
    private nullToJson;
    private fromNullJson;
    toJson<T extends object>(instance: T): string;
    toJsonType<T extends object>(instance: T): JsonType;
    private class2json;
    fromJson<T extends {
        [P in keyof T]: T[P];
    }>(json: string | JsonType, prototype: {
        new (...args: any[]): T;
    } | T): [T, null | Error];
    private json2class;
}
export declare function JsonKey(jsonKey: string, ...jsonKeys: string[]): PropertyDecorator;
//# sourceMappingURL=json.d.ts.map