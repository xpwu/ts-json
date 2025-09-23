import { JsonType } from "./type";
export interface ConstructorJsonDecoder {
    decodeJson(json: JsonType): [any, Error | null];
}
export interface ConstructorJsonEncoder {
    encodeJson<T>(instance: T): JsonType;
}
export interface JsonDecoder {
    decodeJson(json: JsonType): Error | null;
}
export interface JsonEncode {
    encodeJson(): JsonType;
}
export declare class RawJson implements JsonDecoder, JsonEncode {
    raw: JsonType;
    decodeJson(json: JsonType): Error | null;
    encodeJson(): JsonType | null;
}
export declare function hasConstructorDecoder(constructor: object): constructor is ConstructorJsonDecoder;
export declare function hasConstructorEncoder(constructor: object): constructor is ConstructorJsonEncoder;
export declare function hasDecoder(self: object): self is JsonDecoder;
export declare function hasEncoder(self: object): self is JsonEncode;
//# sourceMappingURL=coder.d.ts.map