package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.outlined.Gavel
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.Booking
import com.example.data.BookingStatus
import com.example.data.DisputeStatus
import com.example.data.JobDispute
import com.example.data.PlatformFeeEntry
import com.example.data.VerificationStatus
import com.example.data.WithdrawalRequest
import com.example.data.WithdrawalStatus
import com.example.data.WorkerProfile
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.MetricCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatusBadge
import com.example.ui.components.VerificationBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.RoseDanger
import com.example.ui.theme.RoseDark
import com.example.ui.theme.RoseSoft

@Composable
fun AdminScreen(
    workers: List<WorkerProfile>,
    bookings: List<Booking>,
    withdrawals: List<WithdrawalRequest>,
    platformFees: List<PlatformFeeEntry>,
    disputes: List<JobDispute>,
    onReviewKyc: (workerId: String, approve: Boolean, reason: String?) -> Unit,
    onReviewWithdrawal: (withdrawalId: String, approve: Boolean, utrOrReason: String) -> Unit,
    onResolveDispute: (disputeId: String, refundApproved: Boolean, notes: String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedSubTab by remember { mutableIntStateOf(0) }
    var kycRejectTarget by remember { mutableStateOf<WorkerProfile?>(null) }
    var payoutApproveTarget by remember { mutableStateOf<WithdrawalRequest?>(null) }

    val pendingKycCount = remember(workers) {
        workers.count { it.verificationStatus == VerificationStatus.UNDER_REVIEW || it.verificationStatus == VerificationStatus.SUBMITTED }
    }
    val activeJobsCount = remember(bookings) {
        bookings.count { it.status !in setOf(BookingStatus.PAYMENT_PAID, BookingStatus.CANCELLED) }
    }
    val totalPlatformFees = remember(platformFees) {
        platformFees.filter { it.settlementStatus != "REFUNDED" }.sumOf { it.platformFee }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .widthIn(max = 680.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Total Workers", "${workers.size}", "$pendingKycCount pending KYC", Icons.Default.Engineering, MaterialTheme.colorScheme.primary, Modifier.weight(1f))
                MetricCard("Active Jobs", "$activeJobsCount", "Live dispatch", Icons.Default.VerifiedUser, EmeraldSuccess, Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Payout Queue", "${withdrawals.count { it.status == WithdrawalStatus.REQUESTED }}", "Pending UTR", Icons.Default.AccountBalance, AmberDark, Modifier.weight(1f))
                MetricCard("₹99 Fees", "₹$totalPlatformFees", "${platformFees.size} bookings", Icons.Default.CurrencyRupee, MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
            }
        }

        ScrollableTabRow(
            selectedTabIndex = selectedSubTab,
            containerColor = MaterialTheme.colorScheme.surface,
            edgePadding = 12.dp
        ) {
            Tab(selected = selectedSubTab == 0, onClick = { selectedSubTab = 0 }, text = { Text("KYC ($pendingKycCount)") })
            Tab(selected = selectedSubTab == 1, onClick = { selectedSubTab = 1 }, text = { Text("Payouts") })
            Tab(selected = selectedSubTab == 2, onClick = { selectedSubTab = 2 }, text = { Text("₹99 Fees") })
            Tab(selected = selectedSubTab == 3, onClick = { selectedSubTab = 3 }, text = { Text("Disputes") })
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            when (selectedSubTab) {
                0 -> {
                    item { SectionHeader("Worker KYC Verification Queue", "Approve Aadhaar & NCVT trade documents") }
                    items(workers, key = { it.id }) { worker ->
                        Card(
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
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(worker.fullName, style = MaterialTheme.typography.titleMedium)
                                        Text("${worker.primaryCategoryName} • ${worker.city}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    VerificationBadge(worker.verificationStatus)
                                }
                                Text(worker.kycDocumentSummary, style = MaterialTheme.typography.bodyMedium)
                                if (!worker.rejectionReason.isNullOrBlank()) {
                                    Text("Reason: ${worker.rejectionReason}", style = MaterialTheme.typography.labelLarge, color = RoseDark)
                                }
                                if (worker.verificationStatus != VerificationStatus.VERIFIED) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        OutlinedButton(
                                            onClick = { kycRejectTarget = worker },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("admin_kyc_reject_${worker.id}")
                                        ) {
                                            Text("Reject")
                                        }
                                        Button(
                                            onClick = { onReviewKyc(worker.id, true, null) },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("admin_kyc_approve_${worker.id}")
                                        ) {
                                            Text("Approve KYC")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                1 -> {
                    item { SectionHeader("Worker Payout Queue", "Approve bank/UPI payouts with UTR or refund reserved balance") }
                    items(withdrawals, key = { it.id }) { req ->
                        val (bg, fg) = when (req.status) {
                            WithdrawalStatus.COMPLETED -> EmeraldSoft to EmeraldDark
                            WithdrawalStatus.REJECTED -> RoseSoft to RoseDark
                            else -> AmberSoft to AmberDark
                        }
                        Card(
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
                                    StatusBadge(req.status.name, bg, fg)
                                    Text("₹${req.amount}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                                }
                                Text("${req.workerName} (+91 ${req.workerPhone})", style = MaterialTheme.typography.titleMedium)
                                Text("Target: ${req.payoutTargetMasked} • ${req.requestedAt}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                if (!req.bankTransferReference.isNullOrBlank()) {
                                    Text("UTR Reference: ${req.bankTransferReference}", style = MaterialTheme.typography.labelLarge, color = EmeraldDark)
                                }
                                if (req.status == WithdrawalStatus.REQUESTED || req.status == WithdrawalStatus.PROCESSING) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        OutlinedButton(
                                            onClick = { onReviewWithdrawal(req.id, false, "Bank validation failed — funds restored") },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("admin_payout_reject_${req.id}")
                                        ) {
                                            Text("Reject & Refund")
                                        }
                                        Button(
                                            onClick = { payoutApproveTarget = req },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("admin_payout_approve_${req.id}")
                                        ) {
                                            Text("Approve & UTR")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                2 -> {
                    item { SectionHeader("₹99 Platform Fee Ledger", "Transparent commission & platform fee breakdown") }
                    items(platformFees, key = { it.id }) { entry ->
                        val (bg, fg) = when (entry.settlementStatus) {
                            "SETTLED" -> EmeraldSoft to EmeraldDark
                            "REFUNDED" -> RoseSoft to RoseDark
                            else -> AmberSoft to AmberDark
                        }
                        Card(
                            shape = MaterialTheme.shapes.small,
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("${entry.serviceCategory} • #${entry.bookingId}", style = MaterialTheme.typography.titleMedium)
                                    StatusBadge(entry.settlementStatus, bg, fg)
                                }
                                Text("${entry.customerName} → ${entry.workerName}", style = MaterialTheme.typography.bodyMedium)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Worker: ₹${entry.baseWorkerCharge} • Total: ₹${entry.totalCustomerPayment}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("Fee: ₹${entry.platformFee}", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }

                else -> {
                    item { SectionHeader("Disputes & Quality Resolution", "Resolve customer complaints with refund or dismissal") }
                    if (disputes.isEmpty()) {
                        item {
                            EmptyStateCard(
                                icon = Icons.Outlined.Gavel,
                                title = "No active disputes",
                                description = "All customer bookings are settled cleanly."
                            )
                        }
                    } else {
                        items(disputes, key = { it.id }) { dispute ->
                            val (bg, fg) = when (dispute.status) {
                                DisputeStatus.OPEN -> RoseSoft to RoseDark
                                DisputeStatus.RESOLVED_REFUND -> AmberSoft to AmberDark
                                DisputeStatus.RESOLVED_DISMISSED -> EmeraldSoft to EmeraldDark
                            }
                            Card(
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
                                        StatusBadge(dispute.status.name.replace("_", " "), bg, fg)
                                        Text("#${dispute.bookingId}", style = MaterialTheme.typography.labelSmall)
                                    }
                                    Text("${dispute.customerName} • ${dispute.reason}", style = MaterialTheme.typography.titleMedium)
                                    Text(dispute.description, style = MaterialTheme.typography.bodyMedium)
                                    if (!dispute.resolutionNotes.isNullOrBlank()) {
                                        Text("Resolution: ${dispute.resolutionNotes}", style = MaterialTheme.typography.labelLarge, color = EmeraldDark)
                                    }
                                    if (dispute.status == DisputeStatus.OPEN) {
                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            OutlinedButton(
                                                onClick = { onResolveDispute(dispute.id, false, "Verified job proof — dispute dismissed.") },
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .heightIn(min = 48.dp)
                                                    .testTag("admin_dispute_dismiss_${dispute.id}")
                                            ) {
                                                Text("Dismiss")
                                            }
                                            Button(
                                                onClick = { onResolveDispute(dispute.id, true, "Approved ₹99 fee & partial refund.") },
                                                colors = ButtonDefaults.buttonColors(containerColor = RoseDanger),
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .heightIn(min = 48.dp)
                                                    .testTag("admin_dispute_refund_${dispute.id}")
                                            ) {
                                                Text("Approve Refund")
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (kycRejectTarget != null) {
        var reason by remember { mutableStateOf("Aadhaar rear photo blurred — please re-upload") }
        AlertDialog(
            onDismissRequest = { kycRejectTarget = null },
            title = { Text("Reject KYC for ${kycRejectTarget!!.fullName}") },
            text = {
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Rejection reason") },
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        onReviewKyc(kycRejectTarget!!.id, false, reason)
                        kycRejectTarget = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseDanger)
                ) {
                    Text("Reject KYC")
                }
            },
            dismissButton = {
                TextButton(onClick = { kycRejectTarget = null }) { Text("Cancel") }
            }
        )
    }

    if (payoutApproveTarget != null) {
        var utr by remember { mutableStateOf("UTR${System.currentTimeMillis() % 100000000}") }
        AlertDialog(
            onDismissRequest = { payoutApproveTarget = null },
            title = { Text("Settle Payout ₹${payoutApproveTarget!!.amount}") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Sending to ${payoutApproveTarget!!.payoutTargetMasked}")
                    OutlinedTextField(
                        value = utr,
                        onValueChange = { utr = it },
                        label = { Text("Bank UTR / IMPS Reference") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onReviewWithdrawal(payoutApproveTarget!!.id, true, utr)
                        payoutApproveTarget = null
                    }
                ) {
                    Text("Confirm Settlement")
                }
            },
            dismissButton = {
                TextButton(onClick = { payoutApproveTarget = null }) { Text("Cancel") }
            }
        )
    }
}
