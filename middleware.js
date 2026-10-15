const Listing= require("./models/listing.js");
const Review= require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema} = require("./schema.js");

module.exports.isLoggedIn= (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl= req.originalUrl;
        req.flash("error", "you must be login to create listings");
       return res.redirect("/login");
     }
     next();
 }

 module.exports.saveRedirectUrl=(req , res ,next) => {
    if( req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
 } 


 module.exports.isOwner= async(req, res, next) =>{
    let { id } = req.params;
   let listing= await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id) ){
    req.flash("error", "you dont have permission to perform this");
   return res.redirect(`/listings/${id}`);

   }
   next();
 }

 module.exports.validateListing = (req, res, next) => {
    if (req.body.listing?.categories) {
        if (!Array.isArray(req.body.listing.categories)) {
            req.body.listing.categories = [
                req.body.listing.categories
            ];
        }
    }

    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(", ");
        throw new ExpressError(400, errMsg);
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor= async(req, res, next) =>{
    let {id, reviewId } = req.params;
   let review= await Review.findById(reviewId);
   if(!review.author.equals(res.locals.currUser._id) ){
    req.flash("error", "you dont have permission to perform this");
   return res.redirect(`/listings/${id}`);

   }
   next();
 }