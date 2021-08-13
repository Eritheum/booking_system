const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../api/helpers/date");

const eventsMerge = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEventMerge = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

const userMerge = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: eventsMerge.bind(this, user.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    user: userMerge.bind(this, booking.user),
    event: singleEventMerge.bind(this, booking.event),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
  };
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    date: dateToString(event.date),
    creator: userMerge.bind(this, event.creator),
  };
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
