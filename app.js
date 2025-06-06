const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(`Error occured ${err}`);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("This is root route");
});

// index Route
app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });

});

// Create New Listing
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});
// Create New Listing
app.post("/listings", async (req, res) => {
    // let { title, discription, image, price, country, location } = req.body;
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
    
});

// Edit Listing Route
app.get("/listings/:id/edit", async(req, res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing})
});

// Update Listing PUT Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
})

// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
});

// Delete listins Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

});


app.listen(8080, () => {
    console.log("Server is listing");
});




