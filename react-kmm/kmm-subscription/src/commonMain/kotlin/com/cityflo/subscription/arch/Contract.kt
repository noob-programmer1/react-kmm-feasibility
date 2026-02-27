package com.cityflo.subscription.arch

import kotlin.js.JsName
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Contract interface defining the communication pathways between a ViewModel and the UI layer.
 * Mirrors the CityFlo KMM Contract pattern but without ObjC-specific annotations.
 */
interface Contract<State : Any, Event : UIEvent, Effect : UIEffect> {
    val state: StateFlow<State>
    val event: SharedFlow<Event>
    val effect: Flow<Effect>
    @JsName("sendEvent")
    fun sendEvent(event: Event)
}
