export function uniqueId() {
    let length = 8;
    let timestamp = +new Date();
    let _getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let ts = timestamp.toString();
    let parts = ts.split("").reverse();
    let id = "";

    for (let i = 0; i < length; ++i) {
        let index = _getRandomInt(0, parts.length - 1);
        id += parts[index];
    }

    return id;
}
