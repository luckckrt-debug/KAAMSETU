package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.outlined.Assignment
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.data.ProfessionCatalog
import com.example.data.Tender
import com.example.data.TenderApplication
import com.example.data.TenderApplicationStatus
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.RoseDark
import com.example.ui.theme.RoseSoft

@Composable
fun TendersScreen(
    tenders: List<Tender>,
    applications: List<TenderApplication>,
    currentUserName: String,
    onCreateTender: (
        title: String,
        projectName: String,
        categoryName: String,
        city: String,
        workerCount: Int,
        dailyRate: Int,
        description: String,
        accommodation: Boolean,
        transport: Boolean
    ) -> Unit,
    onApplyToTender: (
        tenderId: String,
        applicantName: String,
        isTeamBid: Boolean,
        proposedRate: Int,
        workersCount: Int,
        coverNote: String
    ) -> Unit,
    onUpdateApplicationStatus: (appId: String, status: TenderApplicationStatus) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedSubTab by remember { mutableIntStateOf(0) }
    var bidTargetTender by remember { mutableStateOf<Tender?>(null) }
    var showPublishDialog by remember { mutableStateOf(false) }

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
                text = { Text("Marketplace") },
                modifier = Modifier.testTag("tenders_tab_marketplace")
            )
            Tab(
                selected = selectedSubTab == 1,
                onClick = { selectedSubTab = 1 },
                text = { Text("Contractor Console") },
                modifier = Modifier.testTag("tenders_tab_contractor")
            )
        }

        if (selectedSubTab == 0) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    SectionHeader(
                        title = "Bulk Workforce Tenders",
                        subtitle = "Project contracts for skilled crews & mistris"
                    )
                }

                if (tenders.isEmpty()) {
                    item {
                        EmptyStateCard(
                            icon = Icons.Outlined.Assignment,
                            title = "No open tenders",
                            description = "Switch to Contractor Console to publish a new bulk project tender."
                        )
                    }
                } else {
                    items(tenders, key = { it.id }) { tender ->
                        val appCount = applications.count { it.tenderId == tender.id }
                        TenderCard(
                            tender = tender,
                            appCount = appCount,
                            onApplyClick = { bidTargetTender = tender }
                        )
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    SectionHeader(
                        title = "Contractor Project Console",
                        subtitle = "Publish requirements & shortlist crew bids",
                        actionLabel = "+ Publish Tender",
                        onActionClick = { showPublishDialog = true }
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Button(
                        onClick = { showPublishDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = DeepNavy),
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 48.dp)
                            .testTag("publish_tender_button")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Publish Bulk Workforce Tender")
                    }
                }

                item {
                    SectionHeader(
                        title = "Incoming Crew Bids (${applications.size})",
                        subtitle = "Shortlist or contract verified site teams"
                    )
                }

                if (applications.isEmpty()) {
                    item {
                        EmptyStateCard(
                            icon = Icons.Default.Groups,
                            title = "No bids received yet",
                            description = "Bids submitted from the Marketplace tab will appear here."
                        )
                    }
                } else {
                    items(applications, key = { it.id }) { app ->
                        val tenderTitle = tenders.firstOrNull { it.id == app.tenderId }?.title ?: app.tenderId
                        TenderApplicationCard(
                            application = app,
                            tenderTitle = tenderTitle,
                            onShortlist = { onUpdateApplicationStatus(app.id, TenderApplicationStatus.SHORTLISTED) },
                            onSelect = { onUpdateApplicationStatus(app.id, TenderApplicationStatus.SELECTED) },
                            onReject = { onUpdateApplicationStatus(app.id, TenderApplicationStatus.REJECTED) }
                        )
                    }
                }
            }
        }
    }

    if (bidTargetTender != null) {
        BidTenderDialog(
            tender = bidTargetTender!!,
            defaultApplicant = currentUserName,
            onDismiss = { bidTargetTender = null },
            onSubmit = { applicant, isTeam, rate, count, note ->
                onApplyToTender(bidTargetTender!!.id, applicant, isTeam, rate, count, note)
                bidTargetTender = null
            }
        )
    }

    if (showPublishDialog) {
        PublishTenderDialog(
            onDismiss = { showPublishDialog = false },
            onPublish = { title, proj, cat, city, count, rate, desc, accom, trans ->
                onCreateTender(title, proj, cat, city, count, rate, desc, accom, trans)
                showPublishDialog = false
            }
        )
    }
}

@Composable
private fun TenderCard(
    tender: Tender,
    appCount: Int,
    onApplyClick: () -> Unit
) {
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
                StatusBadge(
                    text = tender.categoryName,
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    contentColor = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "$appCount bid(s) • Due ${tender.deadline}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(tender.title, style = MaterialTheme.typography.titleMedium)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Apartment, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("${tender.contractorName} • ${tender.projectName}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(tender.description, style = MaterialTheme.typography.bodyMedium)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusBadge(
                    text = "${tender.workerCountRequired} Workers @ ₹${tender.perWorkerRate}/day",
                    containerColor = EmeraldSoft,
                    contentColor = EmeraldDark
                )
                if (tender.accommodationProvided) {
                    StatusBadge(text = "Stay Provided", containerColor = AmberSoft, contentColor = AmberDark)
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    Text("${tender.city}, ${tender.state}", style = MaterialTheme.typography.labelLarge)
                }
                Text(
                    text = "Budget ₹${tender.totalBudget / 1000}k",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.secondary,
                    fontWeight = FontWeight.Bold
                )
            }

            Button(
                onClick = onApplyClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 48.dp)
                    .testTag("apply_tender_btn_${tender.id}")
            ) {
                Text("Submit Crew / Individual Bid")
            }
        }
    }
}

@Composable
private fun TenderApplicationCard(
    application: TenderApplication,
    tenderTitle: String,
    onShortlist: () -> Unit,
    onSelect: () -> Unit,
    onReject: () -> Unit
) {
    val (bg, fg) = when (application.status) {
        TenderApplicationStatus.SELECTED -> EmeraldSoft to EmeraldDark
        TenderApplicationStatus.SHORTLISTED -> MaterialTheme.colorScheme.primaryContainer to MaterialTheme.colorScheme.primary
        TenderApplicationStatus.REJECTED -> RoseSoft to RoseDark
        TenderApplicationStatus.APPLIED -> AmberSoft to AmberDark
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
                StatusBadge(text = application.status.name, containerColor = bg, contentColor = fg)
                Text(application.appliedAt, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(application.applicantName, style = MaterialTheme.typography.titleMedium)
            Text("For: $tenderTitle", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text(
                text = "${application.proposedWorkersCount} worker(s) @ ₹${application.proposedRate}/day • ${if (application.isTeamBid) "Team Bid" else "Individual"}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )
            Text(application.coverNote, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)

            if (application.status == TenderApplicationStatus.APPLIED || application.status == TenderApplicationStatus.SHORTLISTED) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (application.status == TenderApplicationStatus.APPLIED) {
                        OutlinedButton(
                            onClick = onShortlist,
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 48.dp)
                                .testTag("shortlist_bid_btn_${application.id}")
                        ) {
                            Text("Shortlist")
                        }
                    }
                    Button(
                        onClick = onSelect,
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 48.dp)
                            .testTag("select_bid_btn_${application.id}")
                    ) {
                        Text("Contract Crew")
                    }
                    OutlinedButton(
                        onClick = onReject,
                        modifier = Modifier
                            .heightIn(min = 48.dp)
                            .testTag("reject_bid_btn_${application.id}")
                    ) {
                        Text("Reject")
                    }
                }
            }
        }
    }
}

@Composable
private fun BidTenderDialog(
    tender: Tender,
    defaultApplicant: String,
    onDismiss: () -> Unit,
    onSubmit: (applicant: String, isTeam: Boolean, rate: Int, count: Int, note: String) -> Unit
) {
    var applicantName by remember { mutableStateOf("$defaultApplicant Crew") }
    var isTeamBid by remember { mutableStateOf(true) }
    var proposedRate by remember { mutableStateOf(tender.perWorkerRate.toString()) }
    var workersCount by remember { mutableStateOf("6") }
    var coverNote by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Bid on Tender") },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(tender.title, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                OutlinedTextField(
                    value = applicantName,
                    onValueChange = { applicantName = it },
                    label = { Text("Applicant / Crew Lead Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Submitting as Team / Crew")
                    Switch(checked = isTeamBid, onCheckedChange = { isTeamBid = it })
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = proposedRate,
                        onValueChange = { proposedRate = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Daily Rate (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = workersCount,
                        onValueChange = { workersCount = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Workers") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
                OutlinedTextField(
                    value = coverNote,
                    onValueChange = { coverNote = it },
                    label = { Text("Mobilization & Tooling Note") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(
                        applicantName,
                        isTeamBid,
                        proposedRate.toIntOrNull() ?: tender.perWorkerRate,
                        workersCount.toIntOrNull() ?: 1,
                        coverNote
                    )
                },
                modifier = Modifier.testTag("submit_tender_bid_button")
            ) {
                Text("Submit Bid")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
private fun PublishTenderDialog(
    onDismiss: () -> Unit,
    onPublish: (
        title: String,
        projectName: String,
        categoryName: String,
        city: String,
        workerCount: Int,
        dailyRate: Int,
        description: String,
        accommodation: Boolean,
        transport: Boolean
    ) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var projectName by remember { mutableStateOf("Sector 150 Commercial Tower") }
    var categoryName by remember { mutableStateOf(ProfessionCatalog.professions[2].name) }
    var city by remember { mutableStateOf("Noida") }
    var workerCount by remember { mutableStateOf("15") }
    var dailyRate by remember { mutableStateOf("1050") }
    var description by remember { mutableStateOf("30-day civil & plastering contract with bi-weekly milestone settlement.") }
    var accommodation by remember { mutableStateOf(true) }
    var transport by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Publish New Workforce Tender") },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tender Headline") },
                    placeholder = { Text("e.g. 15 Raj Mistri Crew for Tower A") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("publish_tender_title_input")
                )
                OutlinedTextField(
                    value = projectName,
                    onValueChange = { projectName = it },
                    label = { Text("Site / Project Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ProfessionCatalog.professions.take(6).forEach { prof ->
                        FilterChip(
                            selected = categoryName == prof.name,
                            onClick = { categoryName = prof.name },
                            label = { Text(prof.name) }
                        )
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = workerCount,
                        onValueChange = { workerCount = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Count") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = dailyRate,
                        onValueChange = { dailyRate = it.filter { ch -> ch.isDigit() } },
                        label = { Text("₹/Day") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Scope of Work") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = accommodation, onCheckedChange = { accommodation = it })
                    Text("Site Labour Camp / Stay")
                    Spacer(modifier = Modifier.width(8.dp))
                    Checkbox(checked = transport, onCheckedChange = { transport = it })
                    Text("Bus")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onPublish(
                        title.ifBlank { "$categoryName Crew Requirement ($workerCount Workers)" },
                        projectName,
                        categoryName,
                        city,
                        workerCount.toIntOrNull() ?: 10,
                        dailyRate.toIntOrNull() ?: 950,
                        description,
                        accommodation,
                        transport
                    )
                },
                modifier = Modifier.testTag("confirm_publish_tender_button")
            ) {
                Text("Publish")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
