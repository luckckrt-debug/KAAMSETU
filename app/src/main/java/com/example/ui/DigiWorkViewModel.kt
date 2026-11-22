package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.example.data.Booking
import com.example.data.BookingStatus
import com.example.data.DigiWorkRepository
import com.example.data.DigiWorkState
import com.example.data.TenderApplicationStatus
import com.example.data.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppTab(val label: String) {
    HOME("Home"),
    BOOKINGS("Bookings"),
    WORKER("Worker"),
    TENDERS("Tenders"),
    ADMIN("Admin")
}

class DigiWorkViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = DigiWorkRepository(application.applicationContext)
    val state: StateFlow<DigiWorkState> = repo.state

    private val _selectedTab = MutableStateFlow(AppTab.HOME)
    val selectedTab: StateFlow<AppTab> = _selectedTab.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCity = MutableStateFlow("All Cities")
    val selectedCity: StateFlow<String> = _selectedCity.asStateFlow()

    private val _selectedCategorySlug = MutableStateFlow<String?>(null)
    val selectedCategorySlug: StateFlow<String?> = _selectedCategorySlug.asStateFlow()

    private val _preselectedBookingCategory = MutableStateFlow("cat-electrician")
    val preselectedBookingCategory: StateFlow<String> = _preselectedBookingCategory.asStateFlow()

    private val _preselectedWorkerId = MutableStateFlow<String?>(null)
    val preselectedWorkerId: StateFlow<String?> = _preselectedWorkerId.asStateFlow()

    private val _openNewBookingModal = MutableStateFlow(false)
    val openNewBookingModal: StateFlow<Boolean> = _openNewBookingModal.asStateFlow()

    private val _openNewBookingUrgent = MutableStateFlow(false)
    val openNewBookingUrgent: StateFlow<Boolean> = _openNewBookingUrgent.asStateFlow()

    private val _feedbackMessage = MutableStateFlow<String?>(null)
    val feedbackMessage: StateFlow<String?> = _feedbackMessage.asStateFlow()

    fun selectTab(tab: AppTab) {
        _selectedTab.value = tab
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun updateSelectedCity(city: String) {
        _selectedCity.value = city
    }

    fun selectCategoryFilter(slug: String?) {
        _selectedCategorySlug.value = if (_selectedCategorySlug.value == slug) null else slug
    }

    fun startBookingFlow(categoryId: String = "cat-electrician", workerId: String? = null, urgent: Boolean = false) {
        _preselectedBookingCategory.value = categoryId
        _preselectedWorkerId.value = workerId
        _openNewBookingUrgent.value = urgent
        _openNewBookingModal.value = true
        _selectedTab.value = AppTab.BOOKINGS
    }

    fun dismissNewBookingModal() {
        _openNewBookingModal.value = false
        _preselectedWorkerId.value = null
        _openNewBookingUrgent.value = false
    }

    fun clearFeedback() {
        _feedbackMessage.value = null
    }

    private fun postFeedback(message: String) {
        _feedbackMessage.value = message
    }

    fun switchRole(role: UserRole) {
        repo.switchRole(role)
        postFeedback("Switched workspace to ${role.label}")
        _selectedTab.value = when (role) {
            UserRole.CUSTOMER -> AppTab.HOME
            UserRole.WORKER -> AppTab.WORKER
            UserRole.CONTRACTOR -> AppTab.TENDERS
            UserRole.ADMIN -> AppTab.ADMIN
        }
    }

    fun loginWithPhone(phone: String, password: String): Boolean {
        val result = repo.loginWithPhone(phone, password)
        return result.fold(
            onSuccess = { role ->
                postFeedback("Signed in as ${role.label}")
                _selectedTab.value = when (role) {
                    UserRole.CUSTOMER -> AppTab.HOME
                    UserRole.WORKER -> AppTab.WORKER
                    UserRole.CONTRACTOR -> AppTab.TENDERS
                    UserRole.ADMIN -> AppTab.ADMIN
                }
                true
            },
            onFailure = { err ->
                postFeedback(err.message ?: "Login failed")
                false
            }
        )
    }

    fun createBooking(
        categoryId: String,
        description: String,
        isUrgent: Boolean,
        estimatedHours: Int,
        addressLine: String,
        locality: String,
        city: String,
        pincode: String,
        preWorkerId: String?
    ): Booking {
        val booking = repo.createBooking(
            categoryId = categoryId,
            description = description,
            isUrgent = isUrgent,
            estimatedHours = estimatedHours,
            addressLine = addressLine,
            locality = locality,
            city = city,
            pincode = pincode,
            preWorkerId = preWorkerId
        )
        dismissNewBookingModal()
        postFeedback("Booking ${booking.id} created (₹${booking.totalAmount})")
        return booking
    }

    fun toggleWorkerOnline() {
        val nowOnline = repo.toggleWorkerOnline()
        postFeedback(if (nowOnline) "You are now ONLINE for instant bookings" else "You are now OFFLINE")
    }

    fun acceptBooking(bookingId: String) {
        repo.acceptBooking(bookingId).fold(
            onSuccess = { postFeedback("Accepted job #${it.id}") },
            onFailure = { postFeedback(it.message ?: "Unable to accept job") }
        )
    }

    fun declineBooking(bookingId: String) {
        repo.declineBooking(bookingId)
        postFeedback("Declined job #$bookingId")
    }

    fun advanceBookingStatus(bookingId: String, newStatus: BookingStatus, notes: String? = null) {
        repo.advanceBookingStatus(bookingId, newStatus, notes)
        postFeedback("Job updated: ${newStatus.label}")
    }

    fun confirmAndPayBooking(bookingId: String) {
        val netCredited = repo.confirmAndPayBooking(bookingId)
        if (netCredited > 0) {
            postFeedback("Payment settled! Worker credited ₹$netCredited")
        }
    }

    fun submitReview(bookingId: String, quality: Int, timeliness: Int, behaviour: Int, comment: String) {
        repo.submitReview(bookingId, quality, timeliness, behaviour, comment)
        postFeedback("Thank you! 3-tier worker review submitted")
    }

    fun raiseDispute(bookingId: String, reason: String, description: String) {
        repo.raiseDispute(bookingId, reason, description)
        postFeedback("Dispute raised for Admin review")
    }

    fun resolveDispute(disputeId: String, refundApproved: Boolean, notes: String) {
        repo.resolveDispute(disputeId, refundApproved, notes)
        postFeedback(if (refundApproved) "Dispute resolved with customer refund" else "Dispute dismissed")
    }

    fun requestWithdrawal(amount: Int, payoutAccountId: String): Boolean {
        return repo.requestWithdrawal(amount, payoutAccountId).fold(
            onSuccess = {
                postFeedback("Withdrawal ₹${it.amount} requested & funds locked")
                true
            },
            onFailure = {
                postFeedback(it.message ?: "Withdrawal failed")
                false
            }
        )
    }

    fun addPayoutAccount(
        accountType: String,
        holderName: String,
        bankName: String?,
        accountNumberOrUpi: String,
        ifscCode: String?
    ) {
        val acc = repo.addPayoutAccount(accountType, holderName, bankName, accountNumberOrUpi, ifscCode)
        postFeedback("Added payout account: ${acc.maskedTarget}")
    }

    fun reviewWithdrawal(withdrawalId: String, approve: Boolean, utrOrReason: String) {
        repo.reviewWithdrawal(withdrawalId, approve, utrOrReason)
        postFeedback(if (approve) "Withdrawal approved & settled" else "Withdrawal rejected & balance restored")
    }

    fun reviewKyc(workerId: String, approve: Boolean, reason: String?) {
        repo.reviewKyc(workerId, approve, reason)
        postFeedback(if (approve) "Worker KYC Verified" else "Worker KYC Rejected")
    }

    fun createTender(
        title: String,
        projectName: String,
        categoryName: String,
        city: String,
        workerCount: Int,
        dailyRate: Int,
        description: String,
        accommodation: Boolean,
        transport: Boolean
    ) {
        val t = repo.createTender(title, projectName, categoryName, city, workerCount, dailyRate, description, accommodation, transport)
        postFeedback("Published tender #${t.id}")
    }

    fun applyToTender(
        tenderId: String,
        applicantName: String,
        isTeamBid: Boolean,
        proposedRate: Int,
        workersCount: Int,
        coverNote: String
    ) {
        repo.applyToTender(tenderId, applicantName, isTeamBid, proposedRate, workersCount, coverNote)
        postFeedback("Crew bid submitted for tender #$tenderId")
    }

    fun updateTenderApplicationStatus(appId: String, status: TenderApplicationStatus) {
        repo.updateTenderApplicationStatus(appId, status)
        postFeedback("Bid updated to ${status.name}")
    }
}
