const express = require("express");

const users = require("./MOCK_DATA.json")

const app = express();

const fs = require("fs");

const PORT = 8000;

//middleware - plugin
app.use(express.urlencoded({extended: false}));

app.use((req, res, next)=>{
    fs.appendFile("log.txt", `${Date.now()}, ${req.ip}, ${req.method}, ${req.path}\n`, (err, data)=>{
        next();
    })
    console.log("Hello from Middleware 1");
})

app.use((req, res, next)=>{
    console.log("Hello from Middleware 2");
    next();
})

app.get("/", (req, res)=>{
    return res.end("Cannot GET anything, Because didn't add any path or parameters")
})

app.get("/users", (req, res)=>{
    const html = `
        <ol>
            ${users.map((user)=>`<li>${user.first_name}</li>`)}
        </ol>
    `
    return res.send(html)
})

app.get("/api/users", (req, res)=>{
    return res.json(users)
})

app.get("/api/users/:id", (req, res)=>{
    const id = Number(req.params.id);
    const user = users.find((user)=>user.id===id);
    return res.json(user);
})

app.post("/api/users", (req,res)=>{
    const body = req.body;
    // console.log(body);
    users.push({...body, id: users.length+1});
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data)=>{
        return res.json({status: "success", id: users.length});
    })
})

app.patch("/api/users:id", (req,res)=>{
    const id = Number(req.params.id);
    const body = req.body;
    const userIndex = users.findIndex((user)=>user.id===id)
    const gotUser = users[userIndex]; 
    const updatedUser = {...gotUser, ...body};
    users[userIndex] = updatedUser;

    fs.writeFile("/MOCK_DATA.json", JSON.stringify(users), (err,data)=>{
        return res.json({status: "success", updatedUser});
    })
    // return res.json({status: "Pending"})
})

app.delete("/api/users/:id", (req, res)=>{
    const id = Number(req.params.id);
    const userId = users.findIndex((user)=>user.id===id);

    const delUser = users.splice(userId, 1)[0];

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data)=>{
        res.json({status: "Success", delUser});
    })
})

//when route url is same for different requests, we can use the below process

// app.route("/api/users:id")
// .get((req, res)=>{
//     const id = Number(req.params.id);
//     const user = users.map((user=>user.id===id));

//     return res.json(user);
// })
// .patch((req,res)=>{
//     return res.json({status: "Pending"})
// })
// .delete((req, res)=>{
//     return res.json({status: "Pending"})
// })


app.listen(PORT, ()=>console.log(`Server Started at ${PORT}`));