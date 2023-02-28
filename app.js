const express =  require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


const itemSchema = mongoose.Schema({
    name: {
        type:String,
        require:true
    },
}); 

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({
    name:"Welcome to your todolist."
});
const item2 = new Item({
    name:"Hit + to add new item."
});
const item3 = new Item({
    name:"<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];

async function initializeItems(){
    await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
    await Item.insertMany(defaultItems);
    await mongoose.connection.close();
}

app.get("/", function(req, res){

    async function getItems(){
        await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
        const items = await Item.find();
        await mongoose.connection.close();
        if (items.length==0){
            initializeItems().catch(err => console.log(err));
            return defaultItems
        }
        return items
    };
    getItems().then((taskList)=>{
        res.render("list",{listTitle:"Today", newTasks:taskList});
    }).catch(err =>
        console.log(err));

});



app.post("/",function(req, res){
    const newItem = new Item ({
        name:req.body.newValue
    })
    async function insertTask(){
        await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
        await newItem.save();
        await mongoose.connection.close();
    }
    insertTask().then(()=>{
        res.redirect("/");
    }).catch(err=> console.log(err));
   
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work list", newTasks:workList})    
});

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server running on port 3000");
});