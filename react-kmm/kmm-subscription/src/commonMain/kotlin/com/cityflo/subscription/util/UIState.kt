package com.cityflo.subscription.util

/**
 * Sealed class representing the different states of a UI component.
 * Mirrors the CityFlo UiState pattern but simplified for JS export.
 */
sealed class UiState<out T : Any> {

    data object Idle : UiState<Nothing>()

    data class Loading<T : Any>(val initialData: T? = null) : UiState<T>()

    data class Success<T : Any>(val data: T) : UiState<T>()

    data class Failure<T : Any>(
        val lastKnownData: T? = null,
        val errorMessage: String = "Something went wrong"
    ) : UiState<T>()

    companion object {
        fun <T : Any> idle(): UiState<T> = Idle
        fun <T : Any> loading(lastKnownData: T? = null): UiState<T> = Loading(lastKnownData)
        fun <T : Any> success(data: T): UiState<T> = Success(data)
        fun <T : Any> failure(
            lastKnownData: T? = null,
            errorMessage: String = "Something went wrong"
        ): UiState<T> = Failure(lastKnownData, errorMessage)
    }
}

// Extension functions mirroring CityFlo's UIStateHelpers

fun <T : Any> UiState<T>.isLoading(): Boolean = this is UiState.Loading
fun <T : Any> UiState<T>.isIdle(): Boolean = this is UiState.Idle
fun <T : Any> UiState<T>.isSuccess(): Boolean = this is UiState.Success
fun <T : Any> UiState<T>.isFailure(): Boolean = this is UiState.Failure

fun <T : Any> UiState<T>.getOrNull(): T? = when (this) {
    is UiState.Success -> data
    is UiState.Failure -> lastKnownData
    is UiState.Loading -> initialData
    else -> null
}

inline fun <T : Any> UiState<T>.onSuccess(action: (T) -> Unit): UiState<T> {
    if (this is UiState.Success) action(data)
    return this
}

inline fun <T : Any> UiState<T>.onFailure(action: (String) -> Unit): UiState<T> {
    if (this is UiState.Failure) action(errorMessage)
    return this
}

inline fun <T : Any, U : Any> UiState<T>.map(transform: (T) -> U): UiState<U> = when (this) {
    is UiState.Loading -> UiState.Loading(initialData?.let(transform))
    is UiState.Idle -> UiState.Idle
    is UiState.Success -> UiState.Success(transform(data))
    is UiState.Failure -> UiState.Failure(lastKnownData?.let(transform), errorMessage)
}

/**
 * Convenience functions for setState { } blocks (mirrors CityFlo pattern).
 */
fun <T : Any> UiState<T>.success(content: UiState<T>.() -> T) = UiState.success(this.content())
fun <T : Any> UiState<T>.loading(initialData: T? = null) = UiState.Loading(initialData)

/**
 * Convert a NetworkResponse to a UiState.
 */
fun <T : Any, E> NetworkResponse<T, E>.toUiState(
    lastKnownData: T? = null,
    onError: ((String) -> Unit)? = null
): UiState<T> = when (this) {
    is NetworkResponse.Success -> UiState.success(body)
    is NetworkResponse.Error -> {
        val message = when (this) {
            is NetworkResponse.Error.HttpError -> "Server error (code: $code)"
            is NetworkResponse.Error.NetworkError -> "Network error: ${exception.message}"
            is NetworkResponse.Error.SerializationError -> "Data parsing error"
        }
        onError?.invoke(message)
        UiState.failure(lastKnownData, message)
    }
}
