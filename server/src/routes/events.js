import { Router } from "express";
import { ObjectId } from "mongodb";
import { connectDatabase } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validateFutureEvent } from "../validation/event.js";

const router = Router();
const eventsCollection = (db) => db.collection("events");
const participantsCollection = (db) => db.collection("event_participants");

function parseId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function serializeEvent(event) {
  if (!event) return event;
  // Keep organiser email in MongoDB for ownership/contact workflows, but do not
  // expose a personal email address through public event responses.
  const { creatorEmail, ...publicEvent } = event;
  return {
    ...publicEvent,
    _id: event._id.toString(),
    eventDate: new Date(event.eventDate).toISOString(),
    createdAt: new Date(event.createdAt).toISOString(),
    updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : undefined,
    joinedAt: event.joinedAt ? new Date(event.joinedAt).toISOString() : undefined,
  };
}

async function withParticipantCount(db, event) {
  const participantsCount = await participantsCollection(db).countDocuments({ eventId: event._id });
  return serializeEvent({ ...event, participantsCount });
}

function sendValidationError(res, result) {
  return res.status(400).json({ success: false, message: "Please check the event details.", errors: result.errors });
}

// Public: upcoming events only by default. The home page asks for limit=6.
router.get("/events", async (req, res, next) => {
  try {
    const db = await connectDatabase();
    const now = new Date();
    const filter = req.query.scope === "all" ? {} : { eventDate: { $gt: now } };
    if (typeof req.query.type === "string" && req.query.type !== "All causes") filter.eventType = req.query.type;
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const safe = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { location: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }
    const requestedLimit = Number.parseInt(String(req.query.limit || "60"), 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 60;
    const sort = req.query.sort === "latest" ? { createdAt: -1 } : { eventDate: 1 };

    const events = await eventsCollection(db).find(filter).sort(sort).limit(limit).toArray();
    const enrichedEvents = await Promise.all(events.map((event) => withParticipantCount(db, event)));
    return res.json({ success: true, data: enrichedEvents });
  } catch (error) { return next(error); }
});

// Public: event details; authentication is required only for joining.
router.get("/events/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const db = await connectDatabase();
    const event = await eventsCollection(db).findOne({ _id: id });
    if (!event) return res.status(404).json({ success: false, message: "This event could not be found." });
    return res.json({ success: true, data: await withParticipantCount(db, event) });
  } catch (error) { return next(error); }
});

// Protected: create an event for the verified Better Auth user.
router.post("/events", requireAuth, async (req, res, next) => {
  try {
    const validation = validateFutureEvent(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const db = await connectDatabase();
    const now = new Date();
    const event = {
      ...validation.data,
      creatorId: req.user.id,
      creatorEmail: req.user.email,
      creatorName: req.user.name || "Neighbour",
      createdAt: now,
      updatedAt: now,
    };
    const result = await eventsCollection(db).insertOne(event);
    const saved = await eventsCollection(db).findOne({ _id: result.insertedId });
    return res.status(201).json({ success: true, message: "Event created.", data: await withParticipantCount(db, saved) });
  } catch (error) { return next(error); }
});

// Protected: join once. A unique compound index prevents duplicate sign-ups.
router.post("/events/:id/join", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const db = await connectDatabase();
    const event = await eventsCollection(db).findOne({ _id: id });
    if (!event) return res.status(404).json({ success: false, message: "This event could not be found." });
    if (new Date(event.eventDate).getTime() <= Date.now()) {
      return res.status(409).json({ success: false, message: "This event has already passed." });
    }
    const participants = participantsCollection(db);
    const existing = await participants.findOne({ eventId: id, userId: req.user.id });
    if (existing) {
      return res.json({ success: true, message: "You're already on the list.", data: { alreadyJoined: true, participantsCount: await participants.countDocuments({ eventId: id }) } });
    }

    await participants.insertOne({
      eventId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      createdAt: new Date(),
    });
    return res.status(201).json({ success: true, message: "You joined this event.", data: { alreadyJoined: false, participantsCount: await participants.countDocuments({ eventId: id }) } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "You're already on the list." });
    return next(error);
  }
});

// Protected: only the original organiser can update their own event.
router.patch("/events/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const validation = validateFutureEvent(req.body);
    if (!validation.success) return sendValidationError(res, validation);
    const db = await connectDatabase();
    const result = await eventsCollection(db).findOneAndUpdate(
      { _id: id, creatorId: req.user.id },
      { $set: { ...validation.data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) {
      const exists = await eventsCollection(db).findOne({ _id: id }, { projection: { creatorId: 1 } });
      if (!exists) return res.status(404).json({ success: false, message: "Event not found." });
      return res.status(403).json({ success: false, message: "You can only update events you created." });
    }
    return res.json({ success: true, message: "Event updated.", data: await withParticipantCount(db, result) });
  } catch (error) { return next(error); }
});

// Protected: only the original organiser can delete; remove related joins too.
router.delete("/events/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const db = await connectDatabase();
    const result = await eventsCollection(db).deleteOne({ _id: id, creatorId: req.user.id });
    if (result.deletedCount === 0) {
      const exists = await eventsCollection(db).findOne({ _id: id }, { projection: { creatorId: 1 } });
      if (!exists) return res.status(404).json({ success: false, message: "Event not found." });
      return res.status(403).json({ success: false, message: "You can only delete events you created." });
    }
    await participantsCollection(db).deleteMany({ eventId: id });
    return res.json({ success: true, message: "Event deleted.", data: { deleted: true } });
  } catch (error) { return next(error); }
});

// Protected: all events created by the current user.
router.get("/me/events", requireAuth, async (req, res, next) => {
  try {
    const db = await connectDatabase();
    const events = await eventsCollection(db).aggregate([
      { $match: { creatorId: req.user.id } },
      { $sort: { eventDate: 1 } },
      { $lookup: { from: "event_participants", localField: "_id", foreignField: "eventId", as: "participants" } },
      { $addFields: { participantsCount: { $size: "$participants" } } },
      { $project: { participants: 0 } },
    ]).toArray();
    return res.json({ success: true, data: events.map(serializeEvent) });
  } catch (error) { return next(error); }
});

// Protected: joined events, including past events, ordered by event date.
router.get("/me/joined-events", requireAuth, async (req, res, next) => {
  try {
    const db = await connectDatabase();
    const events = await participantsCollection(db).aggregate([
      { $match: { userId: req.user.id } },
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $replaceRoot: { newRoot: { $mergeObjects: ["$event", { joined: true, joinedAt: "$createdAt" }] } } },
      { $sort: { eventDate: 1 } },
      { $lookup: { from: "event_participants", localField: "_id", foreignField: "eventId", as: "participants" } },
      { $addFields: { participantsCount: { $size: "$participants" } } },
      { $project: { participants: 0 } },
    ]).toArray();
    return res.json({ success: true, data: events.map(serializeEvent) });
  } catch (error) { return next(error); }
});

export default router;
