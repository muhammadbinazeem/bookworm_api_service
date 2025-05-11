import express from "express";
import cloudinary from '../lib/cloudinary.js';
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !rating || !caption) { 
            return res.status(400).res({ message: "Please provide all fields"});
        }

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url

        const newBook = new Book({
            tittle,
            caption,
            rating,
            image: imageUrl,
            user: req.isPaused._id
        })

        await newBook.save()

        res.status(201).json(newBook)

    } catch (err) {
        console.log("Error creating book", err.message);
        res.status(500).json({ message: err.message });
    }
});

router.get('/', protectRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;


        const books = await Book.find().sort({ 
            createdAt: -1 
        }).skip(skip).limit(limit)
        .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });

    } catch (err) {
        console.log("Error in get all books route", err.message);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        console.log("Get user books route err", err.message);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log("Error deleting image from cloudianry");
            }
        }

        await book.deleteOne();

        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        console.log("Error in delete route");
        res.status(500).json({ message: "Internal server error"});
    }
});

export default router;