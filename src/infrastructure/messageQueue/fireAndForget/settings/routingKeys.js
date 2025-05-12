const RoutingKeys = {
    // User-related events
    USER_CREATED: "user.created",
    USER_UPDATED: "user.updated",
    USER_DELETED_SOFT: "user.deleted.soft",
    USER_LOGGED_IN: "user.logged_in",
    USER_LOGGED_OUT: "user.logged_out",
    USER_PASSWORD_RESET: "user.password_reset",
    USER_ALL_EVENTS: "user.#",

    // Course-related events
    COURSE_CREATED: "course.created",
    COURSE_UPDATED: "course.updated",
    COURSE_DELETED: "course.deleted",
    COURSE_PUBLISHED: "course.published",
    COURSE_ENROLLED: "course.enrolled",  // Matches course.enrolled.[any ID]
    COURSE_ALL_EVENTS: "course.#",

    // Payment-related events
    // Payment-related events
    PAYMENT_SESSION_COMPLETED: 'checkout.session.completed',
    PAYMENT_INTENT_SUCCESS: 'payment.intent.success',
    PAYMENT_FAILED: 'payment.intent.failed',
    PAYMENT_SESSION_EXPIRED: 'payment.session.expired',
    STRIPE_UNKNOWN_EVENT: 'stripe.unknown',


    // Notification-related events
    NOTIFICATION_SENT: "notification.sent",
    NOTIFICATION_FAILED: "notification.failed",
    NOTIFICATION_ALL: "notification.#",  // Matches all notification events

};

export { RoutingKeys };
