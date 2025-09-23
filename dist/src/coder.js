export class RawJson {
    constructor() {
        this.raw = null;
    }
    decodeJson(json) {
        this.raw = json;
        return null;
    }
    encodeJson() {
        return this.raw;
    }
}
export function hasConstructorDecoder(constructor) {
    let con = constructor;
    return con.decodeJson !== undefined && typeof con.decodeJson === "function"
        && con.decodeJson.length === 1;
}
export function hasConstructorEncoder(constructor) {
    let con = constructor;
    return con.encodeJson !== undefined && typeof con.encodeJson === "function"
        && con.encodeJson.length === 1;
}
export function hasDecoder(self) {
    let sf = self;
    return sf.decodeJson !== undefined && typeof sf.decodeJson === "function"
        && sf.decodeJson.length === 1;
}
export function hasEncoder(self) {
    let sf = self;
    return sf.encodeJson !== undefined && typeof sf.encodeJson === "function"
        && sf.encodeJson.length === 0;
}
//# sourceMappingURL=coder.js.map