require("dotenv").config();

const Inbox = require("../models/Inbox");
const Message = require("../models/Message");

// GET
// api/inbox
async function getInbox(req, res) {
  const userId = req.jwtData.userId; // Get the user ID from the JWT token
  const email = req.jwtData.email;

  if (!userId || !email) {
    return res.status(400).send({ success: false, error: "ID and email are required" });
  }

  try {

    // Find the inbox by userId
    const inbox = await Inbox.findById(userId);

    if (!inbox) {
      // If inbox does not exist, create a new one
      // Populate the inbox with a welcome message
      const welcomeEmail = new Message({
        recipient: email,
        sender: email,
        subject: "Welcome to Your Inbox",
        body: "This is your first message in your new inbox. You can start receiving emails now.",
      });

      const welcomeMessage = await welcomeEmail.save();

      await Inbox.create({
        _id: userId,
        address: email,
        createdAt: new Date(),
        messages: [ welcomeMessage._id ],
      });
    }

    // Fetch all mails for the user
    const data = await Inbox.find({ _id: userId }).populate("messages");

    return res.status(200).send({ success: true, data });

  } catch (error) {
    console.error("Error in fetching mails:", error.message);
    return res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}

module.exports = { getInbox };
