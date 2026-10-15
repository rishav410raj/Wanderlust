
const express = require("express");
const router = express.Router();

const ListingController = require("../controllers/listings.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// INDEX
router.get("/", wrapAsync(ListingController.index));

// SEARCH
router.get("/search", wrapAsync(ListingController.searchListings));

// NEW FORM
router.get(
    "/new",
    isLoggedIn,
    ListingController.renderNewForm
);

// CATEGORY
router.get(
    "/category/:category",
    wrapAsync(ListingController.categoryListings)
);

// CREATE
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.createListing)
);

// EDIT FORM
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.renderEditForm)
);

// UPDATE
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.updateListing)
);

// DELETE
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.destroyListing)
);

// SHOW — keep this after /search, /new, and /category
router.get(
    "/:id",
    wrapAsync(ListingController.ShowListing)
);

module.exports = router;
