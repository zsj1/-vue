/*
function demo(a, b) {
  return a + b;
}
const res = demo(10, 20);
console.log(res);
 */
function demo(a) {
  return function (b) {
    return a + b;
  };
}
// const res = demo(10);
// const res2 = res(20);
// console.log(res2);
const res = demo(10)(20);
console.log(res);
