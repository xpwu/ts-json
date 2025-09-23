export declare class ClassArray<T extends {
    [P in keyof T]: T[P];
}> extends Array<T> {
    constructor(prototype: {
        new (...args: any[]): T;
    } | T);
    newItem(): T;
    private readonly itemPrototype;
}
type NotEmptyArray<T> = Array<T>;
export declare function getArrayItemPrototype<T>(arr: ClassArray<T> | NotEmptyArray<T>): T;
export declare function isClassArray<T extends object>(arg: any): arg is ClassArray<T> | NotEmptyArray<T>;
export declare function isClass(arg: any): arg is {
    [key: number]: any;
};
export declare function isPrimitive(arg: any): arg is number | string | boolean;
export declare function canRecEmptyArray<T>(arg: any): arg is Array<T>;
export declare function isPrimitiveArray<T>(arg: any): arg is Array<T>;
export {};
//# sourceMappingURL=class.d.ts.map