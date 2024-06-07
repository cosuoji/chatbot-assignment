import express from "express"
import {createServer} from "node:http";
import {dirname, join} from "node:path";
import { fileURLToPath } from "node:url";
import path from "path"
import http from "http"
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const io = new Server(server)

const PORT = 9000
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const connections = {}

app.get('/', (req, res)=>{
    res.sendFile(join(__dirname, "index.html"));
})


io.on("connection", (socket) =>{
    console.log("a user connected", socket.id);

    connections[socket.id] = socket

    socket.emit("chat message", "Welcome to the Restaurant Big Bakk")
    socket.emit("chat message", "Select 1 to Place an Order")
    socket.emit("chat message", "Select 99 to See Checkout Order")
    socket.emit("chat message", "Select 98 to See Order History")
    socket.emit("chat message", "Select 97 to See Current Order")
    socket.emit("chat message", "Select 0 to Cancel Order")
    socket.emit("chat message", "Type clear to start over")

    let orderArray = []

    socket.on("chat message", msg=>{
        socket.emit("chat message", msg)
        

        if(msg === "0"){
            socket.emit("chat message", "Order Cancelled - Select an option")
        }  

        if(msg === "1"){
            socket.emit("chat message", "Here are a list of items, press 65 to add Jollof Rice");
            socket.emit("chat message", "press 89 to add Beans,press 365 to add Beef")
            socket.emit("chat message", "press 366 to add Semo,press 367 to add Egusi")
        }

        if(msg === "367"){
         orderArray.push("egusi_soup")
         socket.emit("chat message", "egusi added to order - add more items or proceed to checkout")
         }

        if(msg === "366"){
         orderArray.push("semovita")
         socket.emit("chat message", "semo added to order - add more items or proceed to checkout")
         }

         if(msg === "365"){
         orderArray.push("Beef")
         socket.emit("chat message", "Beef added to order - add more items or proceed to checkout")
         }

        if(msg === "89"){
         orderArray.push("Beans")
         socket.emit("chat message", "beans added to order - add more items or proceed to checkout")
         }

         if(msg === "65"){
         orderArray.push("Jollof_Rice")
         socket.emit("chat message", "Jollof to order - add more items or proceed to checkout")
         }


         if(msg === "99"){
            if(orderArray.length < 1){
                socket.emit("chat message", "No order to place");
            } else{
                socket.emit("chat message", "Order Placed")
                socket.emit("chat message", "Press 1 to Place a new order")
                orderArray = []
            }
            
         }


         if(msg === "97"){
            if(orderArray.length < 1){
                socket.emit("chat message", "No Current Order");
            } else{

                let orderObject = {}
                orderArray.forEach(food =>{
                    if(orderObject[food]){
                        orderObject[food] += 1;
                    }
                    else{
                        orderObject[food] = 1
                    }
                })
                socket.emit("chat message", "current order")
                for(let key in orderObject){
                    socket.emit("chat message", `${orderObject[key]} x ${key}`)
                }
            }
            
         }

         if(msg === "98"){
            
         }

    })
    socket.on("disconnect", ()=>{
        console.log("user disconnected");
    })

})



server.listen(PORT, _ =>{
    console.log("currently listening on, ", PORT )
})
