const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js"); //used for the server-side validation (using Joi validation)

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

// function to wrap the joi [used to validate the fields at server-side for all listings..]
const validateListing = (req, res, next) => {
  console.log(req.body);
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errMsg);

  } else {
    next();
  }
}

// index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });

}));

// Create New Listing
router.get("/new", (req, res) => {
  res.render("./listings/new.ejs");
});

// Create New Listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");

}));

// Edit Listing Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are requested does not exists");
    res.redirect("/listings");
  }
  res.render("./listings/edit.ejs", { listing })
}));

// Update Listing PUT Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing..!");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}))

// show route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews"); // populate() method is use to extract all the info of the reviews collection and show it in the listing collection instead of objectId.
  if (!listing) {
    req.flash("error", "Listing you are requested does not exists");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
}));

// Delete listins Route
router.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");

}));


module.exports = router;