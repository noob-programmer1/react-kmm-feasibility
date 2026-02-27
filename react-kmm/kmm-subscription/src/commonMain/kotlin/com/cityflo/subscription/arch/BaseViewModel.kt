package com.cityflo.subscription.arch

import kotlin.js.JsName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

/**
 * JS-compatible BaseViewModel that mirrors the CityFlo KMM BaseViewModel pattern.
 *
 * Key differences from the Android version:
 * - No androidx.lifecycle.ViewModel dependency (unavailable in Kotlin/JS)
 * - Uses manual CoroutineScope instead of viewModelScope
 * - Provides observeState/observeEffect methods for JS consumption (returns cleanup function)
 * - Provides destroy() for manual lifecycle cleanup
 */
abstract class BaseViewModel<State : Any, Event : UIEvent, Effect : UIEffect>(
    initialState: State
) : Contract<State, Event, Effect> {

    protected val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    @JsName("currentState")
    val currentState: State
        get() = state.value

    private val _event: MutableSharedFlow<Event> = MutableSharedFlow()
    override val event = _event.asSharedFlow()

    private val _state: MutableStateFlow<State> = MutableStateFlow(initialState)
    override val state = _state.asStateFlow()

    private val _effect: Channel<Effect> = Channel()
    override val effect = _effect.receiveAsFlow()

    init {
        subscribeEvents()
    }

    private fun subscribeEvents() {
        scope.launch {
            event.collect { handleEvent(it) }
        }
    }

    protected abstract fun handleEvent(event: Event)

    override fun sendEvent(event: Event) {
        scope.launch { _event.emit(event) }
    }

    protected fun setState(reduce: State.() -> State) {
        val newState = currentState.reduce()
        _state.value = newState
    }

    protected fun setEffect(builder: () -> Effect) {
        val effectValue = builder()
        scope.launch { _effect.send(effectValue) }
    }

    /**
     * Observe state changes from JS. Returns a cleanup function.
     * Usage from React: const cancel = vm.observeState((state) => setState(state))
     */
    @JsName("observeState")
    fun observeState(callback: (State) -> Unit): () -> Unit {
        val job = scope.launch {
            state.collect { callback(it) }
        }
        return { job.cancel() }
    }

    /**
     * Observe one-shot effects from JS. Returns a cleanup function.
     * Usage from React: const cancel = vm.observeEffect((effect) => handleEffect(effect))
     */
    @JsName("observeEffect")
    fun observeEffect(callback: (Effect) -> Unit): () -> Unit {
        val job = scope.launch {
            effect.collect { callback(it) }
        }
        return { job.cancel() }
    }

    /**
     * Manual lifecycle cleanup. Call when the ViewModel is no longer needed.
     * React should call this in useEffect cleanup.
     */
    @JsName("destroy")
    fun destroy() {
        scope.cancel()
    }
}
