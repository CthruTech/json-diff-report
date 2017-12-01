const Evented = require('@cthru/evented');

class Diff extends Evented {
    constructor({ strings = {} }) {
        super();
        this.strings = strings;
    }

    templateStringToFunction(tplStr) {
        return (obj) => (new Function(`return \`${tplStr.replace(/\$\{(this\.)?/igm, '${this.')}\`;`)).call(obj);
    }

    fullDiff(oldObj, newObj, prefix = '') {
        let keys = [...Object.keys(oldObj), ...Object.keys(newObj)].filter((v, i, a) => a.indexOf(v) === i)
        let mods = {};
        keys.forEach(key => {
            let fullAccessor = `${prefix}${key}`;
            let isInOld = (Object.prototype.hasOwnProperty.call(oldObj, key));
            let isInNew = (Object.prototype.hasOwnProperty.call(newObj, key));

            let valOld = isInOld ? oldObj[key] : undefined;
            let valNew = isInNew ? newObj[key] : undefined;

            if (isInOld && !isInNew) {
                mods[fullAccessor] = {
                    key: fullAccessor,
                    old: valOld,
                    new: valNew,
                    operation: 'delete'
                }
            } else if (!isInOld && isInNew) {
                mods[fullAccessor] = {
                    key: fullAccessor,
                    old: valOld,
                    new: valNew,
                    operation: 'add'
                }
            } else {
                if (valOld !== valNew && typeof valNew !== 'object') {
                    mods[fullAccessor] = {
                        key: fullAccessor,
                        old: valOld,
                        new: valNew,
                        operation: 'update'
                    }
                }
            }

            if (typeof valNew === 'object') {
                if (Array.isArray(valNew)) {
                    let changed = false;
                    if (Array.isArray(valOld)) {

                    }
                } else {
                    mods = Object.assign(mods, this.fullDiff(valOld, valNew, `${fullAccessor}.`));
                }
            }
        });
        return mods;
    }

    diff(oldObj, newObj) {
        let diff = this.fullDiff(oldObj, newObj);
        console.log(diff);
        for (let key in diff) {
            let delta = diff[key];
            delta.match = this.findMatch(delta.key, delta.operation);
            delta.messages = null;
            let data = Object.assign({ operation: delta.operation, key: delta.key }, { 'new': newObj, old: oldObj })
            if (delta.match) {
                let strings = this.strings[delta.match];
                if (strings) {
                    if (typeof strings === 'object') {
                        if (Array.isArray(strings)) {
                            delta.messages = strings.map(str => {
                                return this.templateStringToFunction(`${str}`)(data);
                            });
                        } else {
                            delta.messages = {};
                            for (let strName in strings) {
                                let value = `${strings[strName]}`;
                                delta.messages[strName] = this.templateStringToFunction(`${value}`)(data);
                            }
                        }
                    } else {
                        delta.messages = this.templateStringToFunction(`${strings}`)(data);
                    }
                }
            }
        }
        return diff;
    }

    diffMessages(oldObj, newObj) {
        let diff = this.diff(oldObj, newObj);
        let messages = {};
        for (let prop in diff) {
            if (diff[prop].messages) {
                messages[diff[prop].match] = diff[prop].messages;
            }
        }
        return messages;
    }


    findMatch(key, operation) {
        let matches = [];
        let parts = key.split('.');
        while (parts.length > 0) {
            let str = parts.join('.');
            let target = `${str}${(str === key ? '' : '.*')}`;
            matches = [...matches, `${target}:${operation}`, `${target}:*`]
            parts.pop();
        }
        matches = [...matches, `*:${operation}`, `*:*`, '*']
        matches = matches.filter(match => Object.prototype.hasOwnProperty.call(this.strings, match));
        return matches.length > 0 ? matches[0] : null;
    }
}

