package com.cityflo.subscription.presentation.model

enum class SubscriptionStatus(val displayName: String) {
    ACTIVE("Active"),
    EXPIRING_SOON("Expiring Soon"),
    EXPIRED("Expired")
}
