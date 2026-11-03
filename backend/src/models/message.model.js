import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true }, // User _id
		receiverId: { type: String, required: true }, // User _id
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
