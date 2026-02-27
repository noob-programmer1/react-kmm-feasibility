package com.cityflo.subscription.util

/**
 * Simplified NetworkResponse for Kotlin/JS POC.
 * Mirrors the CityFlo NetworkResponse pattern but without Ktor HttpResponse dependency.
 */
sealed interface NetworkResponse<out T, out E> {

    data class Success<T>(val body: T) : NetworkResponse<T, Nothing>

    sealed interface Error<E> : NetworkResponse<Nothing, E> {
        data class HttpError<E>(val code: Int, val errorResponse: E?) : Error<E>
        class NetworkError(val exception: Exception) : Error<Nothing>
        class SerializationError(val exception: Exception) : Error<Nothing>
    }

    fun <R> map(transform: (T) -> R): NetworkResponse<R, E> = when (this) {
        is Success -> Success(transform(body))
        is Error -> this
    }

    fun <R> tryMap(transform: (T) -> R): NetworkResponse<R, E> = when (this) {
        is Success -> {
            try {
                Success(transform(body))
            } catch (e: Exception) {
                Error.SerializationError(e)
            }
        }
        is Error -> this
    }

    suspend fun onSuccess(action: suspend (T) -> Unit): NetworkResponse<T, E> {
        if (this is Success) action(body)
        return this
    }

    suspend fun onFailure(action: suspend (Error<out E>) -> Unit): NetworkResponse<T, E> {
        if (this is Error) action(this)
        return this
    }

    fun <R> fold(
        onSuccess: (T) -> R,
        onError: (Error<out E>) -> R
    ): R = when (this) {
        is Success -> onSuccess(body)
        is Error -> onError(this)
    }

    fun getOrNull(): T? = when (this) {
        is Success -> body
        is Error -> null
    }
}

/**
 * Simplified error type for this POC.
 */
data class ApiError(
    val message: String,
    val code: Int = 0
)

typealias ApiResponse<T> = NetworkResponse<T, ApiError>
