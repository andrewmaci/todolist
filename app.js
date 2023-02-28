const express =  require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

const taskList = [];
const workList = [];


app.get("/", function(req, res){
    

let day = date.getDate();
res.render("list",{listTitle:day, newTasks:taskList});


})

app.listen(3000, function(){
    console.log("Server running on port 3000");
})

app.post("/",function(req, res){

    if(req.body.list == "Work"){
        workList.push(req.body.newValue);
        res.redirect("/work");
    } else {
        taskList.push(req.body.newValue);
    }
    res.redirect("/");
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work list", newTasks:workList})    
})

app.get("/about",function(req,res){
    res.render("about");
})