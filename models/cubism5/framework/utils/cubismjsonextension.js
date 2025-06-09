import { JsonArray, JsonBoolean, JsonFloat, JsonMap, JsonNullvalue, JsonString } from './cubismjson';
export class CubismJsonExtension {
    static parseJsonObject(obj, map) {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] == 'boolean') {
                const convValue = Boolean(obj[key]);
                map.put(key, new JsonBoolean(convValue));
            }
            else if (typeof obj[key] == 'string') {
                const convValue = String(obj[key]);
                map.put(key, new JsonString(convValue));
            }
            else if (typeof obj[key] == 'number') {
                const convValue = Number(obj[key]);
                map.put(key, new JsonFloat(convValue));
            }
            else if (obj[key] instanceof Array) {
                map.put(key, CubismJsonExtension.parseJsonArray(obj[key]));
            }
            else if (obj[key] instanceof Object) {
                map.put(key, CubismJsonExtension.parseJsonObject(obj[key], new JsonMap()));
            }
            else if (obj[key] == null) {
                map.put(key, new JsonNullvalue());
            }
            else {
                map.put(key, obj[key]);
            }
        });
        return map;
    }
    static parseJsonArray(obj) {
        const arr = new JsonArray();
        Object.keys(obj).forEach(key => {
            const convKey = Number(key);
            if (typeof convKey == 'number') {
                if (typeof obj[key] == 'boolean') {
                    const convValue = Boolean(obj[key]);
                    arr.add(new JsonBoolean(convValue));
                }
                else if (typeof obj[key] == 'string') {
                    const convValue = String(obj[key]);
                    arr.add(new JsonString(convValue));
                }
                else if (typeof obj[key] == 'number') {
                    const convValue = Number(obj[key]);
                    arr.add(new JsonFloat(convValue));
                }
                else if (obj[key] instanceof Array) {
                    arr.add(this.parseJsonArray(obj[key]));
                }
                else if (obj[key] instanceof Object) {
                    arr.add(this.parseJsonObject(obj[key], new JsonMap()));
                }
                else if (obj[key] == null) {
                    arr.add(new JsonNullvalue());
                }
                else {
                    arr.add(obj[key]);
                }
            }
            else if (obj[key] instanceof Array) {
                arr.add(this.parseJsonArray(obj[key]));
            }
            else if (obj[key] instanceof Object) {
                arr.add(this.parseJsonObject(obj[key], new JsonMap()));
            }
            else if (obj[key] == null) {
                arr.add(new JsonNullvalue());
            }
            else {
                const convValue = Array(obj[key]);
                for (let i = 0; i < convValue.length; i++) {
                    arr.add(convValue[i]);
                }
            }
        });
        return arr;
    }
}
