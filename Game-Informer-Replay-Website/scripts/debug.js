
// Object Array Test
var baseObjectArray = [{ name: 'first' }, { name: 'second' }, { name: 'third' }, { name: 'fourth' }];
var alteredObjectArrayDeepCopy = baseObjectArray.slice();
var alteredObjectArrayReference = [];
objectArrayTest(baseObjectArray);
function objectArrayTest(baseArr) {
    for (obj of baseArr)
        alteredObjectArrayReference.push(obj);
}