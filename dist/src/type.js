export function isJsonArray(arg) {
    return arg !== null && typeof arg === "object" && arg instanceof Array;
}
export function isJsonObject(arg) {
    return arg !== null && typeof arg === "object" && !(arg instanceof Array);
}
export function isJsonObjectArray(arg) {
    return isJsonArray(arg) && arg.length === 1 && isJsonObject(arg[0]);
}
export function isJsonPrimitive(arg) {
    return typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean";
}
export function isJsonEmptyArray(arg) {
    return isJsonArray(arg) && arg.length == 0;
}
export function isJsonPrimitiveArray(arg) {
    return isJsonArray(arg) && arg.length !== 0 && isJsonPrimitive(arg[0]);
}
export function asNonNull(arg) {
    return arg;
}
//# sourceMappingURL=type.js.map