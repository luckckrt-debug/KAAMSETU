package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsRun
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material.icons.filled.Today
import androidx.compose.material.icons.filled.WorkOutline
import androidx.compose.material.icons.outlined.WorkHistory
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.Booking
import com.example.data.BookingStatus
import com.example.data.PayoutAccount
import com.example.data.WalletLedgerEntry
import com.example.data.WorkerProfile
import com.example.data.WorkerWallet
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.MetricCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatusBadge
import com.example.ui.components.VerificationBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NavyDark
import com.example.ui.theme.RoseDark
import com.example.ui.theme.RoseSoft
import com.example.ui.theme.SkyPulse

@Composable
fun WorkerScreen(
    worker: WorkerProfile,
    bookings: List<Booking>,
    wallet: WorkerWallet,
    ledgerEntries: List<WalletLedgerEntry>,
    payoutAccounts: List<PayoutAccount>,
    onToggleOnline: () -> Unit,
    onAcceptBooking: (String) -> Unit,
    onDeclineBooking: (String) -> Unit,
    onAdvanceStatus: (bookingId: String, nextStatus: BookingStatus, notes: String?) -> Unit,
    onRequestWithdrawal: (amount: Int, payoutAccountId: String) -> Boolean,
    onAddPayoutAccount: (
        accountType: String,
        holderName: String,
        bankName: String?,
        accountNumberOrUpi: String,
        ifscCode: String?
    ) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedSubTab by remember { mutableIntStateOf(0) }
    var showWithdrawDialog by remember { mutableStateOf(false) }
    var showAddAccountDialog by remember { mutableStateOf(false) }
    var ledgerFilter by remember { mutableStateOf("All") }

    val activeJob = remember(bookings, worker.id) {
        bookings.firstOrNull {
            it.assignedWorkerId == worker.id &&
                it.status in setOf(
                    BookingStatus.ACCEPTED,
                    BookingStatus.WORKER_ON_THE_WAY,
                    BookingStatus.ARRIVED,
                    BookingStatus.WORK_STARTED
                )
        }
    }
    val incomingRequests = remember(bookings) {
        bookings.filter { it.status == BookingStatus.REQUESTED }
    }
    val filteredLedger = remember(ledgerEntries, ledgerFilter) {
        when (ledgerFilter) {
            "Earnings" -> ledgerEntries.filter { it.transactionType == "JOB_EARNING" }
            "Withdrawals" -> ledgerEntries.filter { it.transactionType.startsWith("WITHDRAWAL") }
            else -> ledgerEntries
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .widthIn(max = 680.dp)
    ) {
        TabRow(
            selectedTabIndex = selectedSubTab,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            Tab(
                selected = selectedSubTab == 0,
                onClick = { selectedSubTab = 0 },
                text = { Text("Operations") },
                modifier = Modifier.testTag("worker_tab_operations")
            )
            Tab(
                selected = selectedSubTab == 1,
                onClick = { selectedSubTab = 1 },
                text = { Text("Wallet & Payouts") },
                modifier = Modifier.testTag("worker_tab_wallet")
            )
        }

        if (selectedSubTab == 0) {
            WorkerOperationsView(
                worker = worker,
                activeJob = activeJob,
                incomingRequests = incomingRequests,
                onToggleOnline = onToggleOnline,
                onAcceptBooking = onAcceptBooking,
                onDeclineBooking = onDeclineBooking,
                onAdvanceStatus = onAdvanceStatus
            )
        } else {
            WorkerWalletView(
                wallet = wallet,
                ledgerEntries = filteredLedger,
                ledgerFilter = ledgerFilter,
                payoutAccounts = payoutAccounts,
                onLedgerFilterChange = { ledgerFilter = it },
                onOpenWithdraw = { showWithdrawDialog = true },
                onOpenAddAccount = { showAddAccountDialog = true }
            )
        }
    }

    if (showWithdrawDialog) {
        WithdrawMoneyDialog(
            availableBalance = wallet.availableBalance,
            payoutAccounts = payoutAccounts,
            onDismiss = { showWithdrawDialog = false },
            onSubmit = { amount, accId ->
                if (onRequestWithdrawal(amount, accId)) {
                    showWithdrawDialog = false
                }
            }
        )
    }

    if (showAddAccountDialog) {
        AddPayoutAccountDialog(
            defaultHolder = worker.fullName,
            onDismiss = { showAddAccountDialog = false },
            onSave = { type, holder, bank, target, ifsc ->
                onAddPayoutAccount(type, holder, bank, target, ifsc)
                showAddAccountDialog = false
            }
        )
    }
}

@Composable
private fun WorkerOperationsView(
    worker: WorkerProfile,
    activeJob: Booking?,
    incomingRequests: List<Booking>,
    onToggleOnline: () -> Unit,
    onAcceptBooking: (String) -> Unit,
    onDeclineBooking: (String) -> Unit,
    onAdvanceStatus: (String, BookingStatus, String?) -> Unit
) {
    var workNotes by remember(activeJob?.id, activeJob?.status) { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                shape = MaterialTheme.shapes.medium,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(worker.fullName, style = MaterialTheme.typography.titleLarge)
                        Text(worker.primaryCategoryName, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.height(6.dp))
                        VerificationBadge(worker.verificationStatus)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Switch(
                            checked = worker.isOnline,
                            onCheckedChange = { onToggleOnline() },
                            modifier = Modifier.testTag("worker_online_switch")
                        )
                        Text(
                            text = if (worker.isOnline) "ONLINE" else "OFFLINE",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (worker.isOnline) EmeraldDark else RoseDark
                        )
                    }
                }
            }
        }

        item {
            SectionHeader(
                title = "Active Job Console",
                subtitle = "Step-by-step live site execution"
            )
        }

        item {
            if (activeJob == null) {
                EmptyStateCard(
                    icon = Icons.Outlined.WorkHistory,
                    title = "No active job in progress",
                    description = "Accept an incoming work request below to start your shift."
                )
            } else {
                Card(
                    shape = MaterialTheme.shapes.medium,
                    colors = CardDefaults.cardColors(containerColor = DeepNavy)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            StatusBadge(
                                text = activeJob.status.label.uppercase(),
                                containerColor = SkyPulse,
                                contentColor = NavyDark
                            )
                            Text(
                                text = "#${activeJob.id} • Earn ₹${(activeJob.workerBaseCharge * 0.9).toInt()}",
                                style = MaterialTheme.typography.labelLarge,
                                color = Color.White
                            )
                        }
                        Text(
                            text = activeJob.serviceCategoryName,
                            style = MaterialTheme.typography.titleLarge,
                            color = Color.White
                        )
                        Text(
                            text = activeJob.serviceDescription,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                        Text(
                            text = "Site: ${activeJob.addressLine}, ${activeJob.locality}, ${activeJob.city}",
                            style = MaterialTheme.typography.labelLarge,
                            color = SkyPulse
                        )

                        if (activeJob.status == BookingStatus.ARRIVED || activeJob.status == BookingStatus.WORK_STARTED) {
                            OutlinedTextField(
                                value = workNotes,
                                onValueChange = { workNotes = it },
                                label = {
                                    Text(
                                        if (activeJob.status == BookingStatus.ARRIVED) "Before-Work Inspection Notes"
                                        else "After-Work Completion Summary"
                                    )
                                },
                                singleLine = false,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color.White, RoundedCornerShape(10.dp))
                                    .testTag("worker_job_notes_input")
                            )
                        }

                        val (nextStatus, ctaText) = when (activeJob.status) {
                            BookingStatus.ACCEPTED -> BookingStatus.WORKER_ON_THE_WAY to "Start Route (On The Way)"
                            BookingStatus.WORKER_ON_THE_WAY -> BookingStatus.ARRIVED to "Mark Arrived at Site"
                            BookingStatus.ARRIVED -> BookingStatus.WORK_STARTED to "Start Work"
                            BookingStatus.WORK_STARTED -> BookingStatus.WORK_COMPLETED to "Mark Work Completed"
                            else -> null to ""
                        }

                        if (nextStatus != null) {
                            Button(
                                onClick = {
                                    onAdvanceStatus(activeJob.id, nextStatus, workNotes)
                                    workNotes = ""
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 50.dp)
                                    .testTag("worker_advance_status_button")
                            ) {
                                Icon(Icons.Default.DirectionsRun, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(ctaText)
                            }
                        }
                    }
                }
            }
        }

        item {
            SectionHeader(
                title = "Incoming Work Requests (${incomingRequests.size})",
                subtitle = "1-job anti-double-booking lock active"
            )
        }

        if (incomingRequests.isEmpty()) {
            item {
                EmptyStateCard(
                    icon = Icons.Default.WorkOutline,
                    title = "No open requests right now",
                    description = "Keep your status ONLINE to receive instant customer bookings."
                )
            }
        } else {
            items(incomingRequests, key = { it.id }) { req ->
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
                            Text(req.serviceCategoryName, style = MaterialTheme.typography.titleMedium)
                            Text("Est. ₹${req.workerBaseCharge}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        }
                        Text(req.serviceDescription, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = "${req.customerName} • ${req.locality}, ${req.city} (${req.estimatedHours} hrs)",
                            style = MaterialTheme.typography.labelLarge
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onDeclineBooking(req.id) },
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                                    .testTag("decline_job_btn_${req.id}")
                            ) {
                                Text(stringResource(R.string.action_decline))
                            }
                            Button(
                                onClick = { onAcceptBooking(req.id) },
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                                    .testTag("accept_job_btn_${req.id}")
                            ) {
                                Text(stringResource(R.string.action_accept_job))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun WorkerWalletView(
    wallet: WorkerWallet,
    ledgerEntries: List<WalletLedgerEntry>,
    ledgerFilter: String,
    payoutAccounts: List<PayoutAccount>,
    onLedgerFilterChange: (String) -> Unit,
    onOpenWithdraw: () -> Unit,
    onOpenAddAccount: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                shape = MaterialTheme.shapes.large,
                colors = CardDefaults.cardColors(containerColor = DeepNavy)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Brush.linearGradient(listOf(NavyDark, DeepNavy, ElectricBlue.copy(alpha = 0.7f))))
                        .padding(18.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Available Balance", style = MaterialTheme.typography.bodyMedium, color = SkyPulse)
                                Text(
                                    text = "₹${wallet.availableBalance}",
                                    style = MaterialTheme.typography.headlineLarge,
                                    color = Color.White
                                )
                            }
                            StatusBadge(
                                text = "Reserved ₹${wallet.reservedBalance}",
                                containerColor = Color.White.copy(alpha = 0.16f),
                                contentColor = Color.White
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Lifetime Earned", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.75f))
                                Text("₹${wallet.lifetimeEarnings}", style = MaterialTheme.typography.titleMedium, color = Color.White)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Cash Commission Due", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.75f))
                                Text("₹${wallet.commissionPayable}", style = MaterialTheme.typography.titleMedium, color = AmberSoft)
                            }
                        }

                        Button(
                            onClick = onOpenWithdraw,
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 50.dp)
                                .testTag("withdraw_money_button")
                        ) {
                            Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.action_withdraw))
                        }
                    }
                }
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Today", "₹${wallet.todayEarnings}", "Net credit", Icons.Default.Today, EmeraldSuccess, Modifier.weight(1f))
                MetricCard("This Week", "₹${wallet.weekEarnings}", "Active shift", Icons.Default.Paid, MaterialTheme.colorScheme.primary, Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("This Month", "₹${wallet.monthEarnings}", "${wallet.totalCompletedJobs} jobs", Icons.Default.CalendarMonth, MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
                MetricCard("Withdrawn", "₹${wallet.totalWithdrawn}", "Bank & UPI", Icons.Default.CheckCircle, EmeraldDark, Modifier.weight(1f))
            }
        }

        item {
            SectionHeader(
                title = "Bank & UPI Payout Accounts",
                subtitle = "${payoutAccounts.size} verified destination(s)",
                actionLabel = "+ Add Account",
                onActionClick = onOpenAddAccount
            )
            Spacer(modifier = Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                payoutAccounts.forEach { acc ->
                    Card(
                        shape = MaterialTheme.shapes.small,
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AccountBalance, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = if (acc.accountType == "BANK_ACCOUNT") "${acc.bankName} • ${acc.maskedTarget}" else "UPI • ${acc.maskedTarget}",
                                        style = MaterialTheme.typography.labelLarge
                                    )
                                    Text(acc.accountHolderName, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                            if (acc.isPrimary) {
                                StatusBadge("PRIMARY", EmeraldSoft, EmeraldDark)
                            }
                        }
                    }
                }
            }
        }

        item {
            SectionHeader(title = "Transactions Ledger", subtitle = "Full immutable audit trail")
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "Earnings", "Withdrawals").forEach { tab ->
                    FilterChip(
                        selected = ledgerFilter == tab,
                        onClick = { onLedgerFilterChange(tab) },
                        label = { Text(tab) },
                        modifier = Modifier.heightIn(min = 48.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.secondary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        items(ledgerEntries, key = { it.id }) { tx ->
            val isCredit = tx.netAmount > 0
            Card(
                shape = MaterialTheme.shapes.small,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isCredit) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward,
                            contentDescription = null,
                            tint = if (isCredit) EmeraldDark else AmberDark,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(tx.description, style = MaterialTheme.typography.labelLarge)
                            Text("${tx.createdAt} • ${tx.status}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    Text(
                        text = if (isCredit) "+₹${tx.netAmount}" else "-₹${kotlin.math.abs(tx.netAmount)}",
                        style = MaterialTheme.typography.titleMedium,
                        color = if (isCredit) EmeraldDark else MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun WithdrawMoneyDialog(
    availableBalance: Int,
    payoutAccounts: List<PayoutAccount>,
    onDismiss: () -> Unit,
    onSubmit: (amount: Int, payoutAccountId: String) -> Unit
) {
    var amountText by remember { mutableStateOf("500") }
    var selectedAccountId by remember { mutableStateOf(payoutAccounts.firstOrNull()?.id ?: "") }
    val amountVal = amountText.toIntOrNull() ?: 0
    val isValid = amountVal in 100..availableBalance && selectedAccountId.isNotBlank()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Withdraw Wallet Balance") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Available: ₹$availableBalance (Min withdrawal ₹100)", style = MaterialTheme.typography.bodyMedium)
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it.filter { ch -> ch.isDigit() } },
                    label = { Text("Amount (₹)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("withdraw_amount_input")
                )
                HorizontalDivider()
                Text("Select Payout Account", style = MaterialTheme.typography.labelLarge)
                payoutAccounts.forEach { acc ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedAccountId = acc.id }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedAccountId == acc.id,
                            onClick = { selectedAccountId = acc.id }
                        )
                        Text(
                            text = if (acc.accountType == "BANK_ACCOUNT") "${acc.bankName} ${acc.maskedTarget}" else acc.maskedTarget,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(amountVal, selectedAccountId) },
                enabled = isValid,
                modifier = Modifier.testTag("confirm_withdraw_button")
            ) {
                Text("Request ₹$amountVal")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
private fun AddPayoutAccountDialog(
    defaultHolder: String,
    onDismiss: () -> Unit,
    onSave: (type: String, holder: String, bank: String?, target: String, ifsc: String?) -> Unit
) {
    var accountType by remember { mutableStateOf("UPI") }
    var holderName by remember { mutableStateOf(defaultHolder) }
    var bankName by remember { mutableStateOf("") }
    var target by remember { mutableStateOf("") }
    var ifsc by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Payout Account") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = accountType == "UPI",
                        onClick = { accountType = "UPI" },
                        label = { Text("UPI ID") }
                    )
                    FilterChip(
                        selected = accountType == "BANK_ACCOUNT",
                        onClick = { accountType = "BANK_ACCOUNT" },
                        label = { Text("Bank Account") }
                    )
                }
                OutlinedTextField(
                    value = holderName,
                    onValueChange = { holderName = it },
                    label = { Text("Account Holder Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (accountType == "BANK_ACCOUNT") {
                    OutlinedTextField(
                        value = bankName,
                        onValueChange = { bankName = it },
                        label = { Text("Bank Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = target,
                        onValueChange = { target = it },
                        label = { Text("Account Number") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = ifsc,
                        onValueChange = { ifsc = it.uppercase() },
                        label = { Text("IFSC Code") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    OutlinedTextField(
                        value = target,
                        onValueChange = { target = it },
                        label = { Text("UPI ID (e.g. name@okaxis)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(accountType, holderName, bankName, target, ifsc) },
                enabled = target.trim().length >= 4
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save Account")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
