function toSentenceCase(str){
  console.log(str)
  
  return str[0].toUpperCase() + str.slice(1);
}

module.exports = {
  toSentenceCase,
}
