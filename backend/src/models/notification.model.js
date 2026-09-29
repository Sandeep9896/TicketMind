import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    eventName: {
      type: String,
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
