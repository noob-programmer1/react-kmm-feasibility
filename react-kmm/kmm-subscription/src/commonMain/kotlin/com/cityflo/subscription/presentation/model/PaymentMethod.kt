package com.cityflo.subscription.presentation.model

enum class PaymentMethod(val displayName: String) {
    WALLET("CityFlo Wallet"),
    UPI("UPI"),
    CARD("Credit/Debit Card")
}
