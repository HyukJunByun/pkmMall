const express= require('express');
const app= express();
const fs= require('fs');
app.use(express.static('public'));
//access public folder
const sqlite3= require('sqlite3');
const sqlite= require('sqlite');
//for sql db
app.use(express.json());
app.use(express.urlencoded({extended : true}));
//app.use로 위처럼 둘다쓰면 json 먼저 파싱한다.

async function getDBConnection(){
	const db= await sqlite.open({
		filename: 'product.db',
		driver: sqlite3.Database
});
	return db;
}

//GET method -> no update. default page
app.get("/", async function(req, res){
    let db= await getDBConnection();
    let query = "SELECT * FROM products;";
    let rows= await db.all(query);
    let addy= '';
    for(let z = 0; z < rows.length; z++){
        addy += `<div class="horizontal-container" id="showroom">
        <img id= "onSale" src="${rows[z].product_image}" alt="${rows[z].product_title}">
    </div>`;
    }
    const name = '<div class="horizontal-container" id="manyShowrooms">' + addy;
    //app.get에는 아직 아무런 파일이 없다. 따라서 / 접속시 아래 파일로 자동 연결되게 함.
    fs.readFile(__dirname + '/index.html', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error reading HTML file');
        }
    
        const search = data.replace('{{goods}}', name);
        res.send(search);
      });
    await db.close();
});

//POST method -> yes update, modify
app.post("/", async function(req, res){
    let db= await getDBConnection();
    let bow = req.body.generation;
    let title = req.body.search;
    let query = "";
    if(bow == 'All'){
        query = `SELECT * FROM products WHERE product_title LIKE '%${title}%';`;
    }else{
        query= `SELECT * FROM products WHERE product_title LIKE '%${title}%' AND product_category = '${bow}';`;
    }
    
    let rows= await db.all(query);
    let addy= '';
    for(let z = 0; z < rows.length; z++){
        addy += `<div class="horizontal-container" id="showroom">
        <img id= "onSale" src="${rows[z].product_image}" alt="${rows[z].product_title}">
    </div>`;
    }
    const name = '<div class="horizontal-container" id="manyShowrooms">' + addy;
    fs.readFile(__dirname + '/index.html', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error reading HTML file');
        }
    
        const search = data.replace('{{goods}}', name);
        res.send(search);
      });
    await db.close();
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/login.html');
});
app.get("/signup", (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});
app.get("/product/:product_id", (req, res) => {
    res.sendFile(__dirname + '/product.html');
});

app.listen(3000);