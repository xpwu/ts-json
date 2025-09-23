export class ClassArray extends Array {
    constructor(prototype) {
        super();
        // tsbug: 编译为es5后，内建类型继承的原型链会发生错误改变。
        Object.setPrototypeOf(this, ClassArray.prototype);
        if (typeof prototype === "function") {
            this.itemPrototype = new prototype();
        }
        else {
            this.itemPrototype = prototype;
        }
        Object.defineProperty(this, "itemPrototype", { enumerable: false });
    }
    newItem() {
        return this.itemPrototype;
    }
}
export function getArrayItemPrototype(arr) {
    if (arr instanceof ClassArray) {
        return arr.newItem();
    }
    return arr[0];
}
export function isClassArray(arg) {
    return arg !== null && typeof arg === "object" && (arg instanceof ClassArray
        || arg instanceof Array && arg.length !== 0 && isClass(arg[0]));
}
export function isClass(arg) {
    return arg !== null && typeof arg === "object" && !(arg instanceof Array);
}
export function isPrimitive(arg) {
    return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean";
}
export function canRecEmptyArray(arg) {
    return typeof arg === "object" && arg instanceof Array;
}
export function isPrimitiveArray(arg) {
    return typeof arg === "object" && arg instanceof Array && !(arg instanceof ClassArray)
        && (arg.length === 0 || isPrimitive(arg[0]));
}
//# sourceMappingURL=class.js.map