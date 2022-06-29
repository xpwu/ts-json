

export interface Class<T> {
  new(): T
}

export class ClassArray<T> extends Array<T> {

  constructor(clazz: Class<T>) {
    super();
    // tsbug: 编译为es5后，内建类型继承的原型链会发生错误改变。
    Object.setPrototypeOf(this, ClassArray.prototype);

    this.itemClass = clazz;
    Object.defineProperty(this, "itemClass", {enumerable: false});
  }

  public newItem():T {
    return new this.itemClass();
  }

  private readonly itemClass:Class<T>;
}

type NotEmptyArray<T> = Array<T>

export function getArrayItemPrototype<T>(arr: ClassArray<T>|NotEmptyArray<T>): T{
  if (arr instanceof ClassArray) {
    return arr.newItem()
  }

  return arr[0]
}

export function isClassArray<T extends object>(arg: any): arg is ClassArray<T>|NotEmptyArray<T> {
  return arg !== null && typeof arg === "object" && (arg instanceof ClassArray
    || arg instanceof Array && arg.length !== 0 && isClass(arg[0]))
}

export function isClass<T>(arg: any): arg is {[key:number]:any} {
  return arg !== null && typeof arg === "object" && !(arg instanceof Array)
}

export function isPrimitive(arg: any): arg is number|string|boolean {
  return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean"
}

export function canRecEmptyArray<T>(arg: any): arg is Array<T> {
  return typeof arg === "object" && arg instanceof Array
}

export function isPrimitiveArray<T>(arg: any): arg is Array<T> {
  return typeof arg === "object" && arg instanceof Array && !(arg instanceof ClassArray)
    && (arg.length === 0 || isPrimitive(arg[0]))
}

