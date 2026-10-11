const fs=require('fs');
let s=fs.readFileSync('server.js','utf8');
s=s.replace("if (!fs.existsSync('data/users.json'))", "if (!fs.existsSync('data')) fs.mkdirSync('data', {recursive:true});\nif (!fs.existsSync('data/users.json'))");
if (!s.includes('process.env.PORT')) {
  s=s.replace(/app\.listen\(.*\)/, "app.listen(process.env.PORT || 3000, () => console.log('ready'))");
}
fs.writeFileSync('server.js', s);
console.log('patched');
