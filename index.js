const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const path = require("path");
const app = express();
const methodOverride = require("method-override");



app.use(methodOverride("_method"));
app.use (express.urlencoded({extended:true}));


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));



// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'my_app'
});

// Function to generate a random user
function getRandomUser() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    datatype: faker.datatype.uuid()
  };
}




//home route
app.get("/", (req, res) => {
    const q = 'SELECT COUNT(*) AS total_users FROM users';

    connection.query(q, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error in database");
        }

        let count = result[0].total_users; // Shows [{ total_users: 100 }]
        res.render("home.ejs",{count});    // Sends JSON to browser
    });
});
//show route

app.get("/user",(req,res)=>{
    let q = "SELECT * FROM users";
    try{
        connection.query(q,(err,users)=>{
            if(err) throw err;
            // console.log(result);
            res.render("user.ejs",{users});
        });
    }catch(err){
        console.log(err);
        res.send("some error in db");
    }
    });

app.get("/user/:id/edit",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM users WHERE id = '${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user = result[0];
             res.render("edit.ejs",{user});
        });
    }catch(err){
        console.log(err);
        res.send("some error in db");
    }
  
   
});

app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formpassword, username: newUsername } = req.body;

    let q = "SELECT * FROM users WHERE id = ?";
    connection.query(q, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error in DB");
        }

        let user = result[0];
        if (!user) return res.send("User not found");

        if (formpassword !== user.password) {
            return res.send("Wrong password");
        }

        let q2 = "UPDATE users SET name = ? WHERE id = ?";
        connection.query(q2, [newUsername, id], (err, result) => {
            if (err) {
                console.log(err);
                return res.send("Error updating user");
            }
            res.redirect("/user"); // only one response
        });
    });
});



app.listen('8080',()=>{
    console.log("server is running");
})