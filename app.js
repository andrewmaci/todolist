const express =  require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/todolistDB"
const conn = mongoose.createConnection(mongoURI);

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

const Item = mongoose.model("Items",itemSchema)

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

const listSchema = mongoose.Schema({
    name :{
        type:String,
        require:true
    },
    items : [itemSchema]
});

const List = mongoose.model("Lists",listSchema);

async function initializeItems(){
    await mongoose.connect(mongoURI);
    await Item.insertMany(defaultItems);
    await mongoose.connection.close();
}

app.get("/", function(req, res){

    async function getItems(){
        await mongoose.connect(mongoURI);
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
        await mongoose.connect(mongoURI);
        await newItem.save();
        await mongoose.connection.close();
    }
    insertTask().then(()=>{
        res.redirect("/");
    }).catch(err=> console.log(err));
   
});

app.post("/delete",function(req,res){
    const id = req.body.checkboxValue;
    const currentTable = req.body.listTitle
    async function removeTask(){
        await mongoose.connect(mongoURI);
        await Item.findByIdAndDelete(id)
        await mongoose.connection.close();
    }
    removeTask().then(()=>{
        console.log(req.body);
        res.redirect("/"+currentTable);
    }).catch(err=>console.log(err));
});

app.get("/:tableName",function(req,res){
    const customList = req.params.tableName
    async function accessTable() {
        await mongoose.connect(mongoURI)
        const newList = await List.findOne({name:customList})
        if(!newList){
            const list = new List({
                name:customList,
                items: defaultItems
            })
            await list.save();
            res.redirect("/"+customList);
        } else {
            res.render("list",{listTitle:newList.name,newTasks:newList.items})
        }
        await mongoose.connection.close();
    }
    accessTable();
})

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server running on port 3000");
});