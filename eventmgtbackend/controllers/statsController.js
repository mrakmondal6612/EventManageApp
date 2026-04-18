import Event from '../models/Event.js';
import mongoose from 'mongoose';

// Update like count
export const updateLike = async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.eventId;

  console.log("Received API Request:", { eventId, userId });

  if (!userId || !eventId) {
    console.log(" Missing userId or eventId");
    return res.status(400).json({ success: false, msg: "User ID and Event ID are required" });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check if event exists
    const event = await Event.findById(eventId);
    console.log("Found Event in DB:", event);
    if (!event) {
      console.log(" Event Not Found in DB");
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    console.log(" Before Update Likes:", event.likes);

    // Check if user already liked the event
    const index = event.likes.findIndex(id => id.equals(userObjectId));

    let update;
    if (index === -1) {
      update = { $push: { likes: userObjectId } };
    } else {
      update = { $pull: { likes: userObjectId } };
    }

    console.log("Updating MongoDB...");
    const updatedEvent = await Event.updateOne({ _id: eventId }, update);
    console.log(" MongoDB Update Result:", updatedEvent);

    // Fetch updated event data from DB
    const finalEvent = await Event.findById(eventId);
    console.log("Final DB Check Likes:", finalEvent.likes);

    return res.status(200).json({ success: true, likes: finalEvent.likes });

  } catch (err) {
    console.error(" Server Error:", err);
    return res.status(500).json({ success: false, msg: "Server error during like update" });
  }
};

// Update comment count
export const updateComment = async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  const eventId = req.params.eventId;
  const { text } = req.body;

  if (!userId || !text || !eventId) {
    return res.status(400).json({ success: false, msg: "User ID, text, and Event ID are required" });
  }

  try {
    // Validate and convert userId to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ success: false, msg: "Invalid User ID format" });
    }

    // Atomically add the comment
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $push: {
          comments: {
            userId: userObjectId, 
            text,
            date: new Date(), 
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    res.status(200).json({ success: true, msg: "Comment added successfully", comments: event.comments });
  } catch (err) {
    console.error("Error during comment update:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
