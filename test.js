const arr = [{id: 1}, {id: 1}, {id: 2}, {id: 3}, {id: 1, name: 'aa'}];
const unique = arr.filter((item, index, self) => {
  return self.findIndex(ele => {
    return ele.id === item.id;
  }) === index;
})
console.log(unique);