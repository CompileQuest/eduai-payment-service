// Todo: I Need To Add Reverse Reference To The User 


const mongoose = require('mongoose');

// Schema for individual notification categories
const securityAlertsSchema = new mongoose.Schema({
  email_unusual_activity: {
    type: Boolean,
    required: true,
    default: true
  },
  email_new_browser_signin: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

const newsSchema = new mongoose.Schema({
  email_sales_latest_news: {
    type: Boolean,
    required: true,
    default: true
  },
  email_new_features_updates: {
    type: Boolean,
    required: true,
    default: true
  },
  email_tips_on_using_account: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

const coursesSchema = new mongoose.Schema({
  updates_from_classes: {
    type: Boolean,
    required: true,
    default: true
  },
  updates_from_teacher_discussions: {
    type: Boolean,
    required: true,
    default: true
  },
  personalized_class_recommendations: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

const featuredContentSchema = new mongoose.Schema({
  email_tips_on_courses: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

const productUpdatesSchema = new mongoose.Schema({
  newsletter: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

const eventsAndOffersSchema = new mongoose.Schema({
  email_promos_events: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

// Main notification settings schema
const notificationSettingsSchema = new mongoose.Schema({
  notification_settings_id: {
    type: mongoose.Schema.Types.UUID,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.UUID, // Foreign key to the user table
    required: true,
    ref: 'User' // Assuming you have a 'User' model to reference the user
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
  security_alerts: {
    type: securityAlertsSchema,
    required: true
  },
  news: {
    type: newsSchema,
    required: true
  },
  courses: {
    type: coursesSchema,
    required: true
  },
  featured_content: {
    type: featuredContentSchema,
    required: true
  },
  product_updates: {
    type: productUpdatesSchema,
    required: true
  },
  events_and_offers: {
    type: eventsAndOffersSchema,
    required: true
  },
  unsubscribe_all: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Create a model from the schema
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
