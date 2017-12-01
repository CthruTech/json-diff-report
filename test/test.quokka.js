
const Diff=require('../index');

let oObj = {
    author: {
        name: 'peter',
        address: {
            street: '77 humewood',
            suburb: 'parklands'
        }
    },
    id: 540,
    sequence: 540,
    name: 'Wildcards - Sprint 98',
    state: 'CLOSED',
    linkedPagesCount: 0,
    goal: '',
    meta: { revision: 0, created: 1511450774747, version: 0 }
};

let nObj = {
    author: {
        name: 'mark',
        address: {
            street: '23 thetford',
            suburb: 'parklands'
        }
    },
    id: 540,
    sequence: 540,
    name: 'Wildcards - Sprint 99',
    state: 'CLOSED',
    linkedPagesCount: 0,
    goal: '',
    meta: { revision: 0, created: 1511450774748, version: 0 }
};

const diffSprint = new Diff({
    strings: {
        'name:update': { title: 'Sprint Renamed', body: 'Sprint Renamed: ${old.name} => ${new.name}' },
        'meta.created:*': ['Creation Date Altered ${old.meta.created} => ${new.meta.created}'],
        'author.name:update': 'Author name Updated: ${old.name}=>${new.name}',
        'author:*': 'Author ${operation}: ${old.name}=>${new.name}',
        'author.address.*:update': 'Author Address Changed'
    }
});

// let out = diffSprint.diff(oObj, nObj);
let diff = diffSprint.diff(oObj, nObj);
let report = diffSprint.report(oObj, nObj);
let messages = diffSprint.messages(oObj, nObj);
console.log({messages,report,diff});
