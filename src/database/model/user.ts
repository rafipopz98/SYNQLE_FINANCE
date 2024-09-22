import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  currency: {
    type: String,
    enum: ["$", "€", "₹", "¥", "£"],
    default: "$",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
