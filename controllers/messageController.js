require("dotenv").config();

const Message = require("../models/Message");
const Inbox = require("../models/Inbox");

// GET
// api/message/[id]
async function getMessageById(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "message ID is required" });
    }
    const message = await Message.findOne({ _id: id });

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "message do not exist" });
    }

    // Check if the user is authorized to view the message
    if (message.recipient !== req.jwtData.email) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this message",
      });
    }

    return res.json({ status: true, data: message });
  } catch (err) {
    console.error("Unable to fetch message", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// POST
// api/message
async function createMessage(req, res) {
  try {
    const {
      sender,
      recipient,
      subject,
      "body-plain": body,
      "body-html": bodyHtml,
    } = req.body;

    if (!sender || !recipient || !subject || !bodyHtml) {
      return res.status(400).json({
        success: false,
        message: "sender, recipient, subject, body are required fields",
      });
    }

    const cleanedHtml = bodyHtml
      .replace(/\\n/g, "") // remove literal \n
      .replace(/\s*\+\s*/g, "") // remove ` + ` from concatenated lines
      .replace(/^["']|["']$/g, ""); // remove starting/ending quotes if present

    // Check if the sender is authorized
    // if (recipient !== req.jwtData.email) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You are not authorized",
    //   });
    // }

    const message = new Message({
      sender,
      recipient,
      subject,
      bodyHtml: cleanedHtml,
    });
    await message.save();

    // Add the message to the recipient's inbox
    await Inbox.findOneAndUpdate(
      { address: recipient },
      { $push: { messages: message._id } },
      { new: true, upsert: true }
    );

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error("Unable to create a message", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// DELETE
// api/message/[id]

async function deleteMessageById(req, res) {
  try {
    const messageId = req.params.id;

    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      console.error("Invalid Request, message does not exist");
      return res
        .status(404)
        .json({ status: false, message: "message does not exist" });
    }

    // Check if the user is authorized to delete the message
    if (message.recipient !== req.jwtData.email) {
      return res.status(403).json({
        success: false,
        message: "unauthorized request",
      });
    }

    return res.json({ success: true, data: message });
  } catch (err) {
    console.error("Error in deleting message", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { getMessageById, createMessage, deleteMessageById };
