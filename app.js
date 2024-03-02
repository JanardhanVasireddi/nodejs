const express = require("express");

const app = express();

const user_data = require("./users_data.json");

const PORT = 8000;

const fs = require("fs");

//middleware - plugins used here to show the data in req.body through what we did in postman
app.use(express.urlencoded({extended: false}));

app.use((req, res, next)=>{
    fs.appendFile("log1.txt", `${Date.now()}, ${req.method}, ${req.path}, ${req.url}\n`, (err, data)=>{
        next();
    })
    console.log("This is Middleware 1")
})

app.use((req, res, next)=>{
    next();
    console.log("This is Middleware 2")
})

//get empty info because of no path and query parameters
app.get("/", (req, res)=>{
    return res.end("can't return anything, because there was neither path nor query parameters")
});

//get user_data
app.get("/api/user_data", (req, res)=>{
    return res.json(user_data)
});

//get first_name of every user in user_data
app.get("/user_data", (req, res)=>{
    const html = `
        <ul>
            ${user_data.map((user)=>`<li>${user.first_name}</li>`)}
        </ul>
    `
    return res.send(html)
})

//get first_name of user in user_data
app.get("/api/user_data/:id", (req,res)=>{
    const id = Number(req.params.id);
    const user = user_data.find((user)=>user.id === id)
    return res.json(user)
})

//post user in user_data
app.post("/api/user_data/", (req, res)=>{
    const body = req.body;
    // console.log(body);
    user_data.push({id: user_data.length+1, ...body})
    fs.writeFile("./users_data.json", JSON.stringify(user_data), (err, data)=>{
        return res.json({status: "success", id: user_data.length});
    })
})

//patch - whe we want to modify the user data
app.patch("/api/user_data/:id", (req, res)=>{
    const id = Number(req.params.id);
    const body = req.body;
    const userIndex = (user_data.findIndex((user)=>user.id === id));
    const gotUser = user_data[userIndex]
    const updatedUser =  {...gotUser, ...body}
    user_data[userIndex] = updatedUser;

    fs.writeFile("./users_data.json", JSON.stringify(user_data), (err, data)=>{
        return res.json({status: "success", updatedUser});
    })
})

// delete - when we want to delete the user
app.delete("/api/user_data/:id", (req, res)=>{
    const id = Number(req.params.id);
    const userId = user_data.findIndex((user)=>user.id === id)

    const delUser = user_data.splice(userId, 1)[0];

    fs.writeFile("./users_data.json", JSON.stringify(user_data), (err, data)=>{
        return res.json({status: "success", delUser});
    })
})

app.listen(PORT, ()=>console.log(`Server started at port: ${PORT}`))