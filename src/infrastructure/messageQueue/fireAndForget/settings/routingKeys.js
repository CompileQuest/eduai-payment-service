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
    PAYMENT_COMPLETED: "payment.completed",
    PAYMENT_FAILED: "payment.failed",
    PAYMENT_REFUNDED: "payment.refunded",
    PAYMENT_INVOICE_GENERATED: "payment.invoice.generated",
    PAYMENT_ALL_EVENTS: "payment.#",  // Matches any payment-related event

    // Notification-related events
    NOTIFICATION_SENT: "notification.sent",
    NOTIFICATION_FAILED: "notification.failed",
    NOTIFICATION_ALL: "notification.#",  // Matches all notification events

};

export { RoutingKeys };
