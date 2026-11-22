package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.outlined.AdminPanelSettings
import androidx.compose.material.icons.outlined.Assignment
import androidx.compose.material.icons.outlined.Build
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.Profession
import com.example.data.WorkerProfile
import com.example.ui.AppTab
import com.example.ui.DigiWorkViewModel
import com.example.ui.components.DigiWorkTopBar
import com.example.ui.components.LoginAndRoleSheet
import com.example.ui.components.ProfessionDetailSheet
import com.example.ui.components.WorkerDetailSheet
import com.example.ui.screens.AdminScreen
import com.example.ui.screens.BookingsScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.TendersScreen
import com.example.ui.screens.WorkerScreen
import com.example.ui.theme.DigiWorkTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DigiWorkTheme {
                DigiWorkApp()
            }
        }
    }
}

@Composable
fun DigiWorkApp(viewModel: DigiWorkViewModel = viewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedCity by viewModel.selectedCity.collectAsStateWithLifecycle()
    val selectedCategorySlug by viewModel.selectedCategorySlug.collectAsStateWithLifecycle()
    val openNewBookingModal by viewModel.openNewBookingModal.collectAsStateWithLifecycle()
    val preselectedCategory by viewModel.preselectedBookingCategory.collectAsStateWithLifecycle()
    val preselectedWorkerId by viewModel.preselectedWorkerId.collectAsStateWithLifecycle()
    val openNewBookingUrgent by viewModel.openNewBookingUrgent.collectAsStateWithLifecycle()
    val feedbackMessage by viewModel.feedbackMessage.collectAsStateWithLifecycle()

    var showLoginSheet by remember { mutableStateOf(false) }
    var selectedProfession by remember { mutableStateOf<Profession?>(null) }
    var selectedWorker by remember { mutableStateOf<WorkerProfile?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(feedbackMessage) {
        feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearFeedback()
        }
    }

    BackHandler(enabled = selectedTab != AppTab.HOME) {
        viewModel.selectTab(AppTab.HOME)
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val useRail = maxWidth >= 600.dp

        Scaffold(
            contentWindowInsets = WindowInsets(0, 0, 0, 0),
            containerColor = MaterialTheme.colorScheme.background,
            snackbarHost = {
                SnackbarHost(
                    hostState = snackbarHostState,
                    modifier = Modifier.navigationBarsPadding()
                )
            },
            topBar = {
                DigiWorkTopBar(
                    session = state.session,
                    onOpenRoleSwitcher = { showLoginSheet = true }
                )
            },
            bottomBar = {
                if (!useRail) {
                    NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                        AppTab.entries.forEach { tab ->
                            val isSelected = selectedTab == tab
                            val (selectedIcon, unselectedIcon) = tabIcons(tab)
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = { viewModel.selectTab(tab) },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) selectedIcon else unselectedIcon,
                                        contentDescription = tab.label
                                    )
                                },
                                label = {
                                    Text(
                                        text = tab.label,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                },
                                modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (useRail) {
                    NavigationRail(containerColor = MaterialTheme.colorScheme.surface) {
                        AppTab.entries.forEach { tab ->
                            val isSelected = selectedTab == tab
                            val (selectedIcon, unselectedIcon) = tabIcons(tab)
                            NavigationRailItem(
                                selected = isSelected,
                                onClick = { viewModel.selectTab(tab) },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) selectedIcon else unselectedIcon,
                                        contentDescription = tab.label
                                    )
                                },
                                label = { Text(tab.label, maxLines = 1) },
                                modifier = Modifier.testTag("rail_tab_${tab.name.lowercase()}")
                            )
                        }
                    }
                }

                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.TopCenter
                ) {
                    when (selectedTab) {
                        AppTab.HOME -> HomeScreen(
                            workers = state.workers,
                            searchQuery = searchQuery,
                            selectedCity = selectedCity,
                            selectedCategorySlug = selectedCategorySlug,
                            onSearchQueryChange = viewModel::updateSearchQuery,
                            onCityChange = viewModel::updateSelectedCity,
                            onCategoryFilterClick = viewModel::selectCategoryFilter,
                            onOpenProfession = { selectedProfession = it },
                            onOpenWorker = { selectedWorker = it },
                            onUrgentDispatchClick = {
                                viewModel.startBookingFlow(
                                    categoryId = "cat-electrician",
                                    urgent = true
                                )
                            },
                            onBookWorkerClick = { worker ->
                                viewModel.startBookingFlow(
                                    categoryId = worker.primaryCategoryId,
                                    workerId = worker.id,
                                    urgent = false
                                )
                            }
                        )

                        AppTab.BOOKINGS -> BookingsScreen(
                            bookings = state.bookings,
                            workers = state.workers,
                            showNewBookingSheet = openNewBookingModal,
                            initialCategoryId = preselectedCategory,
                            initialWorkerId = preselectedWorkerId,
                            initialUrgent = openNewBookingUrgent,
                            onOpenNewBooking = { viewModel.startBookingFlow() },
                            onDismissNewBooking = viewModel::dismissNewBookingModal,
                            onCreateBooking = { cat, desc, urgent, hrs, addr, loc, city, pin, workerId ->
                                viewModel.createBooking(cat, desc, urgent, hrs, addr, loc, city, pin, workerId)
                            },
                            onConfirmAndPay = viewModel::confirmAndPayBooking,
                            onSubmitReview = viewModel::submitReview,
                            onRaiseDispute = viewModel::raiseDispute
                        )

                        AppTab.WORKER -> {
                            val activeWorker = state.workers.first()
                            WorkerScreen(
                                worker = activeWorker,
                                bookings = state.bookings,
                                wallet = state.wallet,
                                ledgerEntries = state.ledgerEntries,
                                payoutAccounts = state.payoutAccounts,
                                onToggleOnline = viewModel::toggleWorkerOnline,
                                onAcceptBooking = viewModel::acceptBooking,
                                onDeclineBooking = viewModel::declineBooking,
                                onAdvanceStatus = viewModel::advanceBookingStatus,
                                onRequestWithdrawal = viewModel::requestWithdrawal,
                                onAddPayoutAccount = viewModel::addPayoutAccount
                            )
                        }

                        AppTab.TENDERS -> TendersScreen(
                            tenders = state.tenders,
                            applications = state.tenderApplications,
                            currentUserName = state.session.fullName,
                            onCreateTender = viewModel::createTender,
                            onApplyToTender = viewModel::applyToTender,
                            onUpdateApplicationStatus = viewModel::updateTenderApplicationStatus
                        )

                        AppTab.ADMIN -> AdminScreen(
                            workers = state.workers,
                            bookings = state.bookings,
                            withdrawals = state.withdrawals,
                            platformFees = state.platformFees,
                            disputes = state.disputes,
                            onReviewKyc = viewModel::reviewKyc,
                            onReviewWithdrawal = viewModel::reviewWithdrawal,
                            onResolveDispute = viewModel::resolveDispute
                        )
                    }
                }
            }
        }
    }

    if (showLoginSheet) {
        LoginAndRoleSheet(
            currentSession = state.session,
            onSwitchRole = viewModel::switchRole,
            onLoginWithPhone = viewModel::loginWithPhone,
            onDismiss = { showLoginSheet = false }
        )
    }

    selectedProfession?.let { prof ->
        ProfessionDetailSheet(
            profession = prof,
            onBookProfession = { catId ->
                viewModel.startBookingFlow(categoryId = catId)
            },
            onDismiss = { selectedProfession = null }
        )
    }

    selectedWorker?.let { worker ->
        WorkerDetailSheet(
            worker = worker,
            onBookWorker = { target ->
                viewModel.startBookingFlow(
                    categoryId = target.primaryCategoryId,
                    workerId = target.id
                )
            },
            onDismiss = { selectedWorker = null }
        )
    }
}

private fun tabIcons(tab: AppTab): Pair<ImageVector, ImageVector> {
    return when (tab) {
        AppTab.HOME -> Icons.Filled.Home to Icons.Outlined.Home
        AppTab.BOOKINGS -> Icons.Filled.ReceiptLong to Icons.Outlined.ReceiptLong
        AppTab.WORKER -> Icons.Filled.Build to Icons.Outlined.Build
        AppTab.TENDERS -> Icons.Filled.Assignment to Icons.Outlined.Assignment
        AppTab.ADMIN -> Icons.Filled.AdminPanelSettings to Icons.Outlined.AdminPanelSettings
    }
}
