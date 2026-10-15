
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocoadingClient = mbxGeocoding({
    accessToken: mapToken
});

// INDEX
module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
};

// CATEGORY
module.exports.categoryListings = async (req, res) => {
    const { category } = req.params;

    const allListing = await Listing.find({
        categories: category
    });

    res.render("listings/index.ejs", {
        allListing,
        category
    });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// SHOW
module.exports.ShowListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// CREATE
module.exports.createListing = async (req, res) => {
    const response = await geocoadingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    if (!response.body.features.length) {
        req.flash("error", "Location not found");
        return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/w_300,h_200,c_fill"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        {
            runValidators: true,
            new: true
        }
    );

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await listing.save();
    }

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    req.flash("success", "Deleted Listing");
    res.redirect("/listings");
};

// SEARCH
module.exports.searchListings = async (req, res) => {
    const query = (req.query.query || "").trim();

    if (!query) {
        return res.redirect("/listings");
    }

    const allListing = await Listing.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListing });
};
