package com.example.data

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

object GeoUtils {
    private const val EARTH_RADIUS_KM = 6371.0

    fun calculateDistanceKm(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double
    ): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
            cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
            sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return ((EARTH_RADIUS_KM * c) * 10.0).roundToInt() / 10.0
    }

    fun calculateEstimatedEtaMinutes(distanceKm: Double, isUrgent: Boolean = false): Int {
        val avgSpeedKmH = if (isUrgent) 28.0 else 24.0
        val trafficFactor = 1.2
        val rawMinutes = (distanceKm / avgSpeedKmH) * 60.0 * trafficFactor
        return rawMinutes.roundToInt().coerceIn(8, 90)
    }
}
