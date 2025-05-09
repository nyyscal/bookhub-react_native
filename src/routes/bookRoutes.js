import express from "express"
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/Book.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/",protectRoute, async(req,res)=>{

  try {
    const {title,caption,rating,image}= req.body
    console.log("Header",req.headers)

    if(!image || !title || !rating || !caption) return res.status(404).json({message:"Please provide all fields"})

    //upload image ot cloudinary and mongodb
    const uploadResponse = await cloudinary.uploader.upload(image)
    const imageUrl = uploadResponse.secure_url

    //save to db
    const newBook = new Book({
      title,
      caption,
      rating,
      image:imageUrl,
      user:req.user._id //auth user only can create book
    })

    await newBook.save()

    res.status(201).json(newBook)
  } catch (error) {
    console.log("Error in create Book controller",error)
    return res.status(500).json({message:"Internal Server Error!"})
  }
})

//intifite loading + pagination
router.get("/",protectRoute, async(req,res)=>{
  try {

    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page-1)*limit

    const books = await Book.find()
    .sort({createdAt: -1}) //descending order newest to oldest
    .skip(skip)
    .limit(limit)
    .populate("user","username profileImage") 

    const totalBooks = await Book.countDocuments()

    res.send(
      {
        books,
        currentPage:page,
        totalBooks,
        totalPages : Math.ceil(totalBooks/limit)
      }
    ) //default 200


  } catch (error) {
    console.log("Error in getting book controller",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

router.delete("/:id",protectRoute, async(req,res)=>{
  try {
    const {id} = req.params
    const book = await Book.findById(id)
    if(!book) return res.status(404).json({message:"No such book found!"})

    //check if the user is creater of the book
    if(book.user.toString() !== req.user._id.toString()){
      return res.status(401).json({message:"Unauthorized!"})
    }

    //delete image from cloudinary
    if(book.image && book.image.includes("cloudinary")){
      try {
        const publicId = book.image.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(publicId)
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary",deleteError)
      }
    }

    await Book.deleteOne()

    res.json({message:"Book Deleted Succesfully!"})

  } catch (error) {
    console.log("Error in deleting book controller",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

//get recommeded books by user
router.get("/user",protectRoute, async(req,res)=>{
  try {
    const books = await Book.find({user:req.user._id}).sort({createdAt:-1}) //descending order
    res.json(books)
  } catch (error) {
    console.log("Get user books error:", error.message)
    res.status(500).json({message:"Server error"})
  }
})




export default router