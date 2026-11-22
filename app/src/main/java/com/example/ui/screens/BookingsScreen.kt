package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.data.Booking
import com.example.data.BookingStatus
import com.example.data.WorkerProfile
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.AmberWarning
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.RoseDark
import com.example.ui.theme.RoseSoft

@Composable
fun BookingsScreen(
    bookings: List<Booking>,
    workers: List<WorkerProfile>,
    showNewBookingSheet: Boolean,
    initialCategoryId: String,
    initialWorkerId: String?,
    initialUrgent: Boolean,
    onOpenNewBooking: () -> Unit,
    onDismissNewBooking: () -> Unit,
    onCreateBooking: (
        categoryId: String,
        description: String,
        isUrgent: Boolean,
        estimatedHours: Int,
        addressLine: String,
        locality: String,
        city: String,
        pincode: String,
        preWorkerId: String?
    ) -> Unit,
    onConfirmAndPay: (String) -> Unit,
    onSubmitReview: (bookingId: String, quality: Int, timeliness: Int, behaviour: Int, comment: String) -> Unit,
    onRaiseDispute: (bookingId: String, reason: String, description: String) -> Unit,
    modifier: Modifier = Modifier
) {
    var filterTab by remember { mutableStateOf("Active") }
    var selectedBookingId by remember { mutableStateOf<String?>(null) }

    val filteredBookings = remember(bookings, filterTab) {
        when (filterTab) {
            "Active" -> bookings.filter {
                it.status !in setOf(BookingStatus.PAYMENT_PAID, BookingStatus.CANCELLED)
            }
            "Completed" -> bookings.filter {
                it.status == BookingStatus.PAYMENT_PAID || it.status == BookingStatus.CANCELLED
            }
            else -> bookings
        }
    }

    val selectedBooking = remember(bookings, selectedBookingId) {
        selectedBookingId?.let { id -> bookings.firstOrNull { it.id == id } }
    }

    androidx.compose.foundation.layout.Box(
        modifier = modifier
            .fillMaxSize()
            .widthIn(max = 680.dp)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 92.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                SectionHeader(
                    title = "My Service Bookings",
                    subtitle = "Live worker tracking, ₹99 transparent fee & Escrow-style pay"
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Active", "Completed", "All").forEach { tab ->
                        FilterChip(
                            selected = filterTab == tab,
                            onClick = { filterTab = tab },
                            label = { Text(tab) },
                            modifier = Modifier
                                .heightIn(min = 48.dp)
                                .testTag("bookings_filter_${tab.lowercase()}"),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.secondary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }

            if (filteredBookings.isEmpty()) {
                item {
                    EmptyStateCard(
                        icon = Icons.Outlined.ReceiptLong,
                        title = "No $filterTab bookings yet",
                        description = "Tap + New Booking to request an electrician, plumber, or construction crew."
                    )
                }
            } else {
                items(filteredBookings, key = { it.id }) { booking ->
                    BookingSummaryCard(
                        booking = booking,
                        onOpenDetail = { selectedBookingId = booking.id },
                        onConfirmPay = { onConfirmAndPay(booking.id) }
                    )
                }
            }
        }

        ExtendedFloatingActionButton(
            onClick = onOpenNewBooking,
            icon = { Icon(Icons.Default.Add, contentDescription = "Create new booking") },
            text = { Text("New Booking") },
            containerColor = DeepNavy,
            contentColor = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
                .testTag("new_booking_fab")
        )
    }

    if (showNewBookingSheet) {
        NewBookingSheet(
            workers = workers,
            initialCategoryId = initialCategoryId,
            initialWorkerId = initialWorkerId,
            initialUrgent = initialUrgent,
            onDismiss = onDismissNewBooking,
            onConfirmBooking = { cat, desc, urgent, hours, addr, loc, city, pin, workerId ->
                onCreateBooking(cat, desc, urgent, hours, addr, loc, city, pin, workerId)
            }
        )
    }

    if (selectedBooking != null) {
        val assignedWorker = remember(workers, selectedBooking) {
            workers.firstOrNull { it.id == selectedBooking.assignedWorkerId } ?: workers.first()
        }
        BookingDetailSheet(
            booking = selectedBooking,
            worker = assignedWorker,
            onDismiss = { selectedBookingId = null },
            onConfirmAndPay = { onConfirmAndPay(selectedBooking.id) },
            onSubmitReview = { q, t, b, comment ->
                onSubmitReview(selectedBooking.id, q, t, b, comment)
            },
            onRaiseDispute = { reason, desc ->
                onRaiseDispute(selectedBooking.id, reason, desc)
            }
        )
    }
}

@Composable
private fun BookingSummaryCard(
    booking: Booking,
    onOpenDetail: () -> Unit,
    onConfirmPay: () -> Unit
) {
    val (statusBg, statusFg) = bookingStatusColors(booking.status)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onOpenDetail)
            .testTag("booking_card_${booking.id}"),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    StatusBadge(text = booking.status.label, containerColor = statusBg, contentColor = statusFg)
                    if (booking.isUrgent) {
                        StatusBadge(
                            text = "URGENT 30m",
                            containerColor = AmberSoft,
                            contentColor = AmberDark
                        )
                    }
                }
                Text(
                    text = "#${booking.id}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = booking.serviceCategoryName,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = booking.serviceDescription,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "₹${booking.totalAmount}",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.secondary,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "incl. ₹${booking.platformFee} fee",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = booking.assignedWorkerName ?: "Matching nearest pro...",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(15.dp))
                    Text(
                        text = "${booking.locality}, ${booking.city}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onOpenDetail,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 48.dp)
                        .testTag("track_booking_btn_${booking.id}")
                ) {
                    if (booking.isUrgent) {
                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    Text("Track & Details")
                }
                if (booking.status == BookingStatus.WORK_COMPLETED || booking.status == BookingStatus.CUSTOMER_CONFIRMED) {
                    Button(
                        onClick = onConfirmPay,
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 48.dp)
                            .testTag("pay_booking_btn_${booking.id}")
                    ) {
                        Text("Confirm & Pay ₹${booking.totalAmount}")
                    }
                } else if (booking.review != null) {
                    OutlinedButton(
                        onClick = onOpenDetail,
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 48.dp)
                    ) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Rated ${booking.review.ratingOverall}★")
                    }
                }
            }
        }
    }
}

@Composable
fun bookingStatusColors(status: BookingStatus): Pair<Color, Color> {
    return when (status) {
        BookingStatus.PAYMENT_PAID, BookingStatus.WORK_COMPLETED, BookingStatus.CUSTOMER_CONFIRMED ->
            EmeraldSoft to EmeraldDark
        BookingStatus.DISPUTED, BookingStatus.CANCELLED ->
            RoseSoft to RoseDark
        BookingStatus.WORKER_ON_THE_WAY, BookingStatus.ARRIVED, BookingStatus.WORK_STARTED ->
            MaterialTheme.colorScheme.primaryContainer to MaterialTheme.colorScheme.secondary
        BookingStatus.REQUESTED, BookingStatus.ACCEPTED ->
            AmberSoft to AmberDark
    }
}
