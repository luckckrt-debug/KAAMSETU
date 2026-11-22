package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ReportProblem
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.Booking
import com.example.data.BookingStatus
import com.example.data.GeoUtils
import com.example.data.ProfessionCatalog
import com.example.data.WorkerProfile
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.AmberWarning
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.MutedBlueGray
import com.example.ui.theme.RoseDanger
import com.example.ui.theme.SkyPulse

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewBookingSheet(
    workers: List<WorkerProfile>,
    initialCategoryId: String,
    initialWorkerId: String?,
    initialUrgent: Boolean,
    onDismiss: () -> Unit,
    onConfirmBooking: (
        categoryId: String,
        description: String,
        isUrgent: Boolean,
        estimatedHours: Int,
        addressLine: String,
        locality: String,
        city: String,
        pincode: String,
        preWorkerId: String?
    ) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var categoryId by remember { mutableStateOf(initialCategoryId) }
    var description by remember { mutableStateOf("") }
    var isUrgent by remember { mutableStateOf(initialUrgent) }
    var estimatedHours by remember { mutableIntStateOf(2) }
    var addressLine by remember { mutableStateOf("Flat 402, Lotus Boulevard") }
    var locality by remember { mutableStateOf("Sector 100") }
    var city by remember { mutableStateOf("Noida") }
    var pincode by remember { mutableStateOf("201304") }

    val selectedProf = remember(categoryId) {
        ProfessionCatalog.findByIdOrSlug(categoryId) ?: ProfessionCatalog.professions.first()
    }
    val preWorker = remember(initialWorkerId, workers) {
        initialWorkerId?.let { id -> workers.firstOrNull { it.id == id } }
    }
    val hourlyRate = preWorker?.hourlyRate ?: selectedProf.baseHourlyRate
    val baseCharge = hourlyRate * estimatedHours
    val urgentSurcharge = if (isUrgent) 149 else 0
    val platformFee = 99
    val totalAmount = baseCharge + urgentSurcharge + platformFee

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Create Service Booking", style = MaterialTheme.typography.titleLarge)
                    if (preWorker != null) {
                        Text(
                            text = "Direct booking with ${preWorker.fullName}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close new booking form")
                }
            }

            Text("Select Trade Category", style = MaterialTheme.typography.labelLarge)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ProfessionCatalog.professions.forEach { prof ->
                    FilterChip(
                        selected = categoryId == prof.id,
                        onClick = { categoryId = prof.id },
                        label = { Text(prof.name) },
                        modifier = Modifier.heightIn(min = 48.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Describe the issue or scope") },
                placeholder = { Text("e.g. MCB tripping in kitchen or ceiling fan installation") },
                minLines = 2,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("new_booking_description")
            )

            Card(
                shape = MaterialTheme.shapes.medium,
                colors = CardDefaults.cardColors(containerColor = if (isUrgent) AmberSoft else MaterialTheme.colorScheme.surfaceVariant),
                border = BorderStroke(1.dp, if (isUrgent) AmberWarning else MaterialTheme.colorScheme.outline)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = AmberDark)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("Urgent 30-Min Dispatch (+₹149)", style = MaterialTheme.typography.labelLarge)
                            Text("Priority GPS ping to nearby verified specialists", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    Switch(
                        checked = isUrgent,
                        onCheckedChange = { isUrgent = it },
                        modifier = Modifier.testTag("new_booking_urgent_switch")
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Estimated Duration", style = MaterialTheme.typography.labelLarge)
                    Text("₹$hourlyRate/hr base rate", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { if (estimatedHours > 1) estimatedHours-- },
                        modifier = Modifier.testTag("hours_minus_button")
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease hours")
                    }
                    Text(
                        text = "$estimatedHours hrs",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                    IconButton(
                        onClick = { if (estimatedHours < 10) estimatedHours++ },
                        modifier = Modifier.testTag("hours_plus_button")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Increase hours")
                    }
                }
            }

            OutlinedTextField(
                value = addressLine,
                onValueChange = { addressLine = it },
                label = { Text("Flat / House No. & Street") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = locality,
                    onValueChange = { locality = it },
                    label = { Text("Locality") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("City") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = pincode,
                    onValueChange = { pincode = it.filter { ch -> ch.isDigit() }.take(6) },
                    label = { Text("PIN") },
                    singleLine = true,
                    modifier = Modifier.width(96.dp)
                )
            }

            Card(
                shape = MaterialTheme.shapes.medium,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Transparent Pricing Breakdown", style = MaterialTheme.typography.titleMedium)
                    PriceLine("Worker Base Charge ($estimatedHours hrs × ₹$hourlyRate)", "₹$baseCharge")
                    if (isUrgent) {
                        PriceLine("Urgent 30-Min Priority Dispatch", "₹$urgentSurcharge")
                    }
                    PriceLine("DigiWork Platform Fee (Insurance & Support)", "₹$platformFee")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Payable", style = MaterialTheme.typography.titleMedium)
                        Text(
                            text = "₹$totalAmount",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }

            Button(
                onClick = {
                    onConfirmBooking(
                        categoryId,
                        description,
                        isUrgent,
                        estimatedHours,
                        addressLine,
                        locality,
                        city,
                        pincode,
                        initialWorkerId
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 50.dp)
                    .testTag("confirm_create_booking_button"),
                colors = ButtonDefaults.buttonColors(containerColor = DeepNavy)
            ) {
                Text("Confirm Booking • ₹$totalAmount")
            }
        }
    }
}

@Composable
private fun PriceLine(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurface)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingDetailSheet(
    booking: Booking,
    worker: WorkerProfile,
    onDismiss: () -> Unit,
    onConfirmAndPay: () -> Unit,
    onSubmitReview: (quality: Int, timeliness: Int, behaviour: Int, comment: String) -> Unit,
    onRaiseDispute: (reason: String, description: String) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var showReviewDialog by remember { mutableStateOf(false) }
    var showDisputeDialog by remember { mutableStateOf(false) }

    val distanceKm = remember(booking, worker) {
        GeoUtils.calculateDistanceKm(
            booking.customerLatitude,
            booking.customerLongitude,
            worker.latitude,
            worker.longitude
        )
    }
    val etaMins = remember(distanceKm, booking.isUrgent) {
        GeoUtils.calculateEstimatedEtaMinutes(distanceKm, booking.isUrgent)
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Booking #${booking.id}",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = booking.serviceCategoryName,
                        style = MaterialTheme.typography.titleLarge
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close booking details")
                }
            }

            // 7-Step Lifecycle Stepper
            BookingLifecycleStepper(status = booking.status)

            // Live Simulated GPS Route & ETA Visualizer
            LiveRouteVisualizerCard(
                workerName = booking.assignedWorkerName ?: "Dispatching Specialist",
                customerLocality = "${booking.locality}, ${booking.city}",
                distanceKm = distanceKm,
                etaMins = etaMins,
                status = booking.status
            )

            if (!booking.beforeWorkNotes.isNullOrBlank() || !booking.afterWorkNotes.isNullOrBlank()) {
                Card(
                    shape = MaterialTheme.shapes.medium,
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Work Execution Notes", style = MaterialTheme.typography.titleMedium)
                        if (!booking.beforeWorkNotes.isNullOrBlank()) {
                            Text("Inspection: ${booking.beforeWorkNotes}", style = MaterialTheme.typography.bodyMedium)
                        }
                        if (!booking.afterWorkNotes.isNullOrBlank()) {
                            Text("Completion: ${booking.afterWorkNotes}", style = MaterialTheme.typography.bodyMedium, color = EmeraldDark)
                        }
                    }
                }
            }

            Card(
                shape = MaterialTheme.shapes.medium,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    PriceLine("Base Worker Charge (${booking.estimatedHours} hrs)", "₹${booking.workerBaseCharge}")
                    if (booking.urgentSurcharge > 0) {
                        PriceLine("Urgent 30-Min Dispatch", "₹${booking.urgentSurcharge}")
                    }
                    PriceLine("DigiWork Platform Fee", "₹${booking.platformFee}")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    PriceLine("Total Booking Value", "₹${booking.totalAmount}")
                }
            }

            if (booking.status == BookingStatus.WORK_COMPLETED || booking.status == BookingStatus.CUSTOMER_CONFIRMED) {
                Button(
                    onClick = onConfirmAndPay,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 50.dp)
                        .testTag("detail_confirm_pay_button")
                ) {
                    Text("Confirm Work & Pay ₹${booking.totalAmount}")
                }
            }

            if (booking.status == BookingStatus.PAYMENT_PAID && booking.review == null) {
                Button(
                    onClick = { showReviewDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = DeepNavy),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 50.dp)
                        .testTag("open_review_dialog_button")
                ) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = AmberWarning)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Rate Specialist (3-Tier Review)")
                }
            }

            if (booking.review != null) {
                Card(
                    shape = MaterialTheme.shapes.medium,
                    colors = CardDefaults.cardColors(containerColor = EmeraldSoft)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Rated ${booking.review.ratingOverall}★ (Quality ${booking.review.ratingQuality}, Speed ${booking.review.ratingTimeliness}, Behaviour ${booking.review.ratingBehaviour})",
                            style = MaterialTheme.typography.labelLarge,
                            color = EmeraldDark
                        )
                        Text(booking.review.comment, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            if (booking.status != BookingStatus.DISPUTED && booking.status != BookingStatus.CANCELLED) {
                OutlinedButton(
                    onClick = { showDisputeDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .testTag("open_dispute_dialog_button"),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = RoseDanger)
                ) {
                    Icon(Icons.Default.ReportProblem, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Raise Quality / Pricing Dispute")
                }
            }
        }
    }

    if (showReviewDialog) {
        ThreeTierReviewDialog(
            onDismiss = { showReviewDialog = false },
            onSubmit = { q, t, b, comment ->
                onSubmitReview(q, t, b, comment)
                showReviewDialog = false
            }
        )
    }

    if (showDisputeDialog) {
        RaiseDisputeDialog(
            onDismiss = { showDisputeDialog = false },
            onSubmit = { reason, desc ->
                onRaiseDispute(reason, desc)
                showDisputeDialog = false
            }
        )
    }
}

@Composable
private fun BookingLifecycleStepper(status: BookingStatus) {
    val steps = listOf("Req", "Accept", "Way", "Arrived", "Work", "Done", "Paid")
    val activeIdx = status.stepIndex

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        steps.forEachIndexed { idx, label ->
            val reached = activeIdx >= idx
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(if (reached) EmeraldSuccess else MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    if (reached) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                    } else {
                        Text("${idx + 1}", style = MaterialTheme.typography.labelSmall, color = MutedBlueGray)
                    }
                }
                Spacer(modifier = Modifier.height(3.dp))
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (reached) MaterialTheme.colorScheme.onSurface else MutedBlueGray
                )
            }
        }
    }
}

@Composable
private fun LiveRouteVisualizerCard(
    workerName: String,
    customerLocality: String,
    distanceKm: Double,
    etaMins: Int,
    status: BookingStatus
) {
    val progress = when (status) {
        BookingStatus.REQUESTED -> 0.10f
        BookingStatus.ACCEPTED -> 0.25f
        BookingStatus.WORKER_ON_THE_WAY -> 0.62f
        BookingStatus.ARRIVED, BookingStatus.WORK_STARTED, BookingStatus.WORK_COMPLETED, BookingStatus.CUSTOMER_CONFIRMED, BookingStatus.PAYMENT_PAID -> 1.0f
        else -> 0.0f
    }

    Card(
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = DeepNavy)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Live GPS Route & ETA", style = MaterialTheme.typography.titleMedium, color = Color.White)
                    Text("$workerName → $customerLocality", style = MaterialTheme.typography.bodyMedium, color = SkyPulse)
                }
                StatusBadge(
                    text = if (progress >= 1f) "At Site" else "$etaMins mins (${distanceKm} km)",
                    containerColor = Color.White.copy(alpha = 0.16f),
                    contentColor = Color.White
                )
            }

            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
            ) {
                val startX = 28f
                val endX = size.width - 28f
                val midY = size.height * 0.55f
                val currentX = startX + (endX - startX) * progress

                drawLine(
                    color = Color.White.copy(alpha = 0.25f),
                    start = Offset(startX, midY),
                    end = Offset(endX, midY),
                    strokeWidth = 8f,
                    cap = StrokeCap.Round,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(16f, 12f), 0f)
                )
                drawLine(
                    color = SkyPulse,
                    start = Offset(startX, midY),
                    end = Offset(currentX, midY),
                    strokeWidth = 10f,
                    cap = StrokeCap.Round
                )
                drawCircle(color = ElectricBlue, radius = 14f, center = Offset(startX, midY))
                drawCircle(color = EmeraldSuccess, radius = 16f, center = Offset(endX, midY))
                drawCircle(color = Color.White, radius = 18f, center = Offset(currentX, midY))
                drawCircle(color = AmberWarning, radius = 11f, center = Offset(currentX, midY))
            }
        }
    }
}

@Composable
private fun ThreeTierReviewDialog(
    onDismiss: () -> Unit,
    onSubmit: (quality: Int, timeliness: Int, behaviour: Int, comment: String) -> Unit
) {
    var quality by remember { mutableIntStateOf(5) }
    var timeliness by remember { mutableIntStateOf(5) }
    var behaviour by remember { mutableIntStateOf(5) }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Rate Work Experience") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                StarRatingRow("Work Quality", quality) { quality = it }
                StarRatingRow("Timeliness", timeliness) { timeliness = it }
                StarRatingRow("Behaviour & Hygiene", behaviour) { behaviour = it }
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Review comment") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(quality, timeliness, behaviour, comment) },
                modifier = Modifier.testTag("submit_review_button")
            ) {
                Text("Submit Review")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
private fun StarRatingRow(label: String, rating: Int, onChange: (Int) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Row {
            (1..5).forEach { star ->
                Icon(
                    imageVector = if (star <= rating) Icons.Default.Star else Icons.Default.StarBorder,
                    contentDescription = "Rate $star stars",
                    tint = AmberWarning,
                    modifier = Modifier
                        .size(28.dp)
                        .clickable { onChange(star) }
                )
            }
        }
    }
}

@Composable
private fun RaiseDisputeDialog(
    onDismiss: () -> Unit,
    onSubmit: (reason: String, description: String) -> Unit
) {
    var reason by remember { mutableStateOf("OVERCHARGING") }
    var description by remember { mutableStateOf("") }
    val reasons = listOf("OVERCHARGING", "INCOMPLETE_WORK", "LATE_ARRIVAL")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Raise Booking Dispute") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    reasons.forEach { r ->
                        FilterChip(
                            selected = reason == r,
                            onClick = { reason = r },
                            label = { Text(r.replace("_", " ")) }
                        )
                    }
                }
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Describe issue for Admin review") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(reason, description) },
                colors = ButtonDefaults.buttonColors(containerColor = RoseDanger),
                modifier = Modifier.testTag("submit_dispute_button")
            ) {
                Text("Submit Dispute")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
