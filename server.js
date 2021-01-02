const express = require("express");
const bodyParser = require("body-parser");
const mongosse = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
mongosse.connect("mongodb://localhost:27017/foodDB", { useNewUrlParser: true, useUnifiedTopology: true });

const usersScheme = {//here we have created a scheme which defines how each document should be sent to the 
    //paticular collections
    name: String,
    email: String,
    password: String,
    address: String
}

const hotelScheme = {//this is the hotels scheme this specifies how each document should be entered in hotel 
    //collection
    hotelName: String,
    hotelEmail: String,
    hotelPassword: String,
    hotelAddress: String,
    hotelType: String,
}

const dishScheme = {
    hotelName: String,
    dishName: String,
    dishPrice: Number,
}
const oderScheme = {
    hotelName: String,
    customerName: String,
    customerAddress: String,
    foodOdered: dishScheme,
}
const Users = mongosse.model("user", usersScheme);
const Hotels = mongosse.model("hotel", hotelScheme);
const Oders = mongosse.model("oder", oderScheme);
const Dishes = mongosse.model("dish", dishScheme)

let hotelsToDisplay = [];

app.get("/", (req, res) => {
    res.render("home");
});

//register account

//this is the route where the customer has to register a new account
app.route("/customerRegister")
    .get((req, res) => {
        res.render("customerRegister")
    })
    .post((req, res) => {
        let userEmail = req.body.userEmail;
        let name = req.body.name;
        let userPassword = req.body.userPassword;
        let usersAddress = req.body.userAddress
        console.log(req.body);
        const newUser = new Users({
            name: name,
            email: userEmail,
            password: userPassword,
            address: usersAddress
        });

        newUser.save(() => { hotelsToDisplay = [];
            Hotels.find((err, dataFound) => {
                dataFound.forEach((currentElement) => {
                    hotelsToDisplay.push({
                        hotelName: currentElement.hotelName,
                        hotelType: currentElement.hotelType
                    });

                });
                console.log(hotelsToDisplay);
                res.render("restaurants", {
                    hotelInfo: hotelsToDisplay,
                });
            });
        });
    });


//this is the route where the hotel has to register 
app.route("/hotelRegister")
    .get((req, res) => {
        res.render("hotelRegister")
    })
    .post((req, res) => {
        console.log(req);
        let hotelEmail = req.body.hotelEmail;
        let hotelName = req.body.hotelName;
        let hotelPassword = req.body.hotelPassword;
        let hotelAddress = req.body.hotelAddress;
        let hotelType = req.body.hotelType;
        console.log(req.body.dishName1 + " " + req.body.dishPrice1);

        let hotelDish1 = new Dishes({
            hotelName: hotelName,
            dishName: req.body.dishName1,
            dishPrice: req.body.dishPrice1
        });
        let hotelDish2 = new Dishes({
            hotelName: hotelName,
            dishName: req.body.dishName2,
            dishPrice: req.body.dishPrice2
        });
        let hotelDish3 = new Dishes({
            hotelName: hotelName,
            dishName: req.body.dishName3,
            dishPrice: req.body.dishPrice3
        });

        const newHotel = new Hotels({
            hotelName: hotelName,
            hotelEmail: hotelEmail,
            hotelPassword: hotelPassword,
            hotelAddress: hotelAddress,
            hotelType: hotelType
        });

        let hotelsDishes = [hotelDish1, hotelDish2, hotelDish3]
        Dishes.insertMany(hotelsDishes);
        newHotel.save(() => {
            res.send("Succesfully regestered your hotel")
            //    res.render("yourOders");
        });
    });

//login

//this is route where a aldready registered users login

app.route("/customerLogin")
    .get((req, res) => {
        res.render("customerLogin")
    })
    .post((req, res) => {
        const userEnteredEmail = req.body.registerEmail;
        const userEnteredPassword = req.body.registerPassword;

        Users.findOne({ email: userEnteredEmail }, (err, dataFound) => {
            if (err) {
                console.log(err);
            }
            if (dataFound == null) {
                res.redirect("/customerLogin")
            }
            else if (dataFound.password == userEnteredPassword) {
                //here we have to serach for all the hotels present and render it 
                hotelsToDisplay = [];
                Hotels.find((err, dataFound) => {
                    dataFound.forEach((currentElement) => {
                        hotelsToDisplay.push({
                            hotelName: currentElement.hotelName,
                            hotelType: currentElement.hotelType
                        });

                    });
                    console.log(hotelsToDisplay);
                    res.render("restaurants", {
                        hotelInfo: hotelsToDisplay,
                    });
                });
                //here you have to render all the hotels present to oder from
            }
            else {
                res.redirect("/customerLogin")
            }
        });
    });

//this is the route where a aldready registered hotels login

app.route("/hotelLogin")
    .get((req, res) => {
        res.render("hotelLogin")
    })
    .post((req, res) => {
        // console.log(req.body);
        const hotelEnteredEmail = req.body.email;
        const hotelEnteredPassword = req.body.password;
        // console.log(hotelEnteredEmail);
        Hotels.findOne({ hotelEmail: hotelEnteredEmail }, (err, dataFound) => {
            console.log(dataFound);
            if (err) {
                console.log(err);
            }
            else if (dataFound.hotelPassword == hotelEnteredPassword) {
                Oders.find({ hotelName : req.body.hotelName },(err,datafoundOnOders)=>{
                    res.render("yourOders",{
                        oderData:datafoundOnOders
                    });//here you have to render oders made to the hotel
                })
               
            }
            else {
                res.redirect("/hotelLogin")
            }
        });
    });

//hotles Page

//here if a user clicks on a paticular hotel displaying it should take them to that paticular page
app.route("/users/:hotelName")
    .post((req, res) => {
        const dishesToDisplay = [];
        const hotelToDisplay = req.params.hotelName;
        console.log(hotelToDisplay);
        Dishes.find({ hotelName: hotelToDisplay }, (err, dataFound) => {
            console.log(dataFound);
            dataFound.forEach((currentDish) => {
                dishesToDisplay.push({
                    dishName: currentDish.dishName,
                    dishPrice: currentDish.dishPrice
                });
            });
            console.log(dishesToDisplay);
            res.render("hotel",
                {
                    hotelName: hotelToDisplay,
                    hotelDishes: dishesToDisplay,
                    userOderedAddress: "Arjun"
                }
            )

        });

    })

//Oders    

//Make Oders this is a place where the user gets to make oders 

app.route("/makeOder/:hotelName/:dishName")
    .get((req, res) => {
        // console.log(req.params.dishName)
        let dishPrice;
        Dishes.findOne({ dishName: req.params.dishName, hotelName: req.params.hotelName }, (err, dataFound) => {
            dishPrice = dataFound.dishPrice
            res.render("placeOder", {
                dishName: req.params.dishName,
                dishPrice: dishPrice,
                hotelName:dataFound.hotelName,
            });
        })

    })
    .post((req, res) => {
        //here you need to store the oder 
        const customerName = req.body.name
        const customerAddress = req.body.address;
        const hotelName = req.params.hotelName;
        const dishName = req.params.dishName;
        const dishPrice = req.body.dishPrice;

        const newOder = new Oders({
            hotelName: hotelName,
            customerName: customerName,
            customerAddress: customerAddress,
            foodOdered: {
                hotelName:hotelName,
                dishName:dishName,
                dishPrice:dishPrice
            }//here will be the dish details
        })
        newOder.save(()=>{
            res.send("Oder succesfully made")
        })
    })


app.listen(3000, () => {
    console.log("Succesfully hosted the files locally on port 3000");
})