import express from "express"
import {dirname, join} from "node:path";
import { fileURLToPath } from "node:url";
import http from "http"
import { Server } from "socket.io";
import session from "express-session";
import mongoose from "mongoose";
import sessionDatabase from "./database/sessionSchema.js";



const app = express();
const server = http.createServer(app);
const io = new Server(server)
const MONGODB_URI = "mongodb+srv://test_user:password123456@bookstore.gvhx48w.mongodb.net/sessionData?retryWrites=true&w=majority&appName=bookstore"


const PORT = 9000
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const connections = {}

//attach session
const sessionMiddleware = session({
  secret: "changeit",
  //resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 300000000000 },

});

app.use(sessionMiddleware)
io.engine.use(sessionMiddleware);


app.get('/', (req, res)=>{
if (req.session.views) {
    req.session.views++;
    }
    else{
      req.session.views = 1;  
    }
    res.sendFile(join(__dirname, "index.html"));
})





io.on("connection", (socket) =>{
    console.log("a user connected", socket.id);
    connections[socket.id] = socket

    const sessionId = socket.request.session.id
    console.log(sessionId)
    socket.emit("chat message", "Welcome to the Restaurant Big Bakk")
    socket.emit("chat message", "Select 1 to Place an Order")
    socket.emit("chat message", "Select 99 to Checkout Order and Pay")
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
                socket.emit("chat message", "Order Placed, Thanks")
                socket.emit("chat message", "Press 1 to Place a new order")
              const newOrder = async() =>{
                let newSessionStorage = await sessionDatabase.find({sessionId:sessionId}); 
                if(newSessionStorage.length > 0){
                    let time = new Date()
                    const filter = {sessionId: sessionId}
                    const update = { $push: {previous_Orders: orderArray, date_order_was_placed: time}}
                    let result = await sessionDatabase.findOneAndUpdate(filter, update)
                    //console.log(result)
                    orderArray = []
                    
                }  
                else{
                    newSessionStorage = new sessionDatabase({sessionId: sessionId});
                    newSessionStorage.previous_Orders.push(orderArray)
                    let time = new Date()
                    newSessionStorage.date_order_was_placed.push(time)
                    await newSessionStorage.save()
                    orderArray = []
                }
            }
            newOrder()             
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
            const result = async() =>{
              let answer = await sessionDatabase.find({sessionId:sessionId}); 
              if(answer.length < 1){
                socket.emit("chat message", "no order history, Please place and order to get started")
              }else{
                let orderHistoryArray = answer[0].previous_Orders
                let dateHistory = answer[0].date_order_was_placed

                socket.emit("chat message", "Order History")

                for(let i = 0; i < orderHistoryArray.length; i++){
                let dateAnswer = `${dateHistory[i].getDate()} - ${dateHistory[i].getMonth() + 1} - ${dateHistory[i].getFullYear()}`
                 let orderObject = {}
                    orderHistoryArray[i].forEach(food =>{
                    if(orderObject[food]){
                        orderObject[food] += 1;
                    }
                    else{
                        orderObject[food] = 1
                    }
                })
                for(let key in orderObject){
                    socket.emit("chat message", `${orderObject[key]} x ${key}, ${dateAnswer}`)
                }

                }
              }


             

            }  

            result()
         }

    })
    socket.on("disconnect", ()=>{
        console.log("user disconnected");
    })

})





//connect to DB
mongoose.connect(MONGODB_URI)
    .then(()=>{
        console.log("Connected to DB")
        server.listen(PORT, _ =>{
            console.log("to do app is running on PORT", PORT)
        })
    })




 

            