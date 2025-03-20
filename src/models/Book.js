const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    ISBN: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Changed from 1 to 0 to allow books to be fully borrowed
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Custom validation for new book creation
BookSchema.pre("save", function (next) {
  // Only apply this validation when creating a new book (not when updating)
  if (this.isNew && this.quantity < 1) {
    const error = new Error("New books must have at least 1 copy");
    return next(error);
  }
  next();
});

module.exports = mongoose.model("Book", BookSchema);
