package com.example.data

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class DigiWorkState(
    val session: UserSession = UserSession(
        userId = "user-cust-1",
        fullName = "Ramesh Kumar",
        phoneNumber = "9876543212",
        activeRole = UserRole.CUSTOMER,
        city = "Delhi NCR"
    ),
    val workers: List<WorkerProfile> = SeedData.defaultWorkers,
    val bookings: List<Booking> = SeedData.defaultBookings,
    val tenders: List<Tender> = SeedData.defaultTenders,
    val tenderApplications: List<TenderApplication> = SeedData.defaultTenderApps,
    val wallet: WorkerWallet = SeedData.defaultWallet,
    val ledgerEntries: List<WalletLedgerEntry> = SeedData.defaultLedger,
    val payoutAccounts: List<PayoutAccount> = SeedData.defaultPayoutAccounts,
    val withdrawals: List<WithdrawalRequest> = SeedData.defaultWithdrawals,
    val platformFees: List<PlatformFeeEntry> = SeedData.defaultPlatformFees,
    val disputes: List<JobDispute> = SeedData.defaultDisputes
)

class DigiWorkRepository(context: Context) {
    private val storeFile = File(context.filesDir, "digiwork_store_v1.json")
    private val _state = MutableStateFlow(loadInitialState())
    val state: StateFlow<DigiWorkState> = _state.asStateFlow()

    private fun nowStamp(): String {
        return SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
    }

    private fun loadInitialState(): DigiWorkState {
        if (!storeFile.exists()) {
            val initial = DigiWorkState()
            persist(initial)
            return initial
        }
        return try {
            val json = JSONObject(storeFile.readText())
            decodeState(json)
        } catch (_: Exception) {
            val fallback = DigiWorkState()
            persist(fallback)
            fallback
        }
    }

    private fun updateAndSave(transform: (DigiWorkState) -> DigiWorkState) {
        _state.update { current ->
            val next = transform(current)
            persist(next)
            next
        }
    }

    fun switchRole(role: UserRole) {
        val (id, name, phone) = when (role) {
            UserRole.CUSTOMER -> Triple("user-cust-1", "Ramesh Kumar", "9876543212")
            UserRole.WORKER -> Triple("user-worker-1", "Rajesh Sharma", "9876543210")
            UserRole.CONTRACTOR -> Triple("user-cont-1", "Vikram Construction Co.", "9876543211")
            UserRole.ADMIN -> Triple("user-admin-1", "Super Admin Desk", "9999999999")
        }
        updateAndSave { s ->
            s.copy(
                session = s.session.copy(
                    userId = id,
                    fullName = name,
                    phoneNumber = phone,
                    activeRole = role,
                    isLoggedIn = true
                )
            )
        }
    }

    fun loginWithPhone(phone: String, password: String): Result<UserRole> {
        val clean = phone.filter { it.isDigit() }
        if (clean.length != 10) {
            return Result.failure(IllegalArgumentException("Enter a valid 10-digit Indian mobile number."))
        }
        if (password.length < 4) {
            return Result.failure(IllegalArgumentException("Password must be at least 4 characters."))
        }
        val targetRole = when (clean) {
            "9876543210" -> UserRole.WORKER
            "9876543211" -> UserRole.CONTRACTOR
            "9999999999" -> UserRole.ADMIN
            else -> UserRole.CUSTOMER
        }
        switchRole(targetRole)
        return Result.success(targetRole)
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
        preWorkerId: String? = null
    ): Booking {
        val profession = ProfessionCatalog.findByIdOrSlug(categoryId) ?: ProfessionCatalog.professions.first()
        val preWorker = preWorkerId?.let { id -> _state.value.workers.firstOrNull { it.id == id } }
        val hourly = preWorker?.hourlyRate ?: profession.baseHourlyRate
        val baseCharge = hourly * estimatedHours.coerceIn(1, 10)
        val urgentFee = if (isUrgent) 149 else 0
        val platformFee = 99
        val total = baseCharge + urgentFee + platformFee

        val booking = Booking(
            id = "bk-${System.currentTimeMillis() % 100000}",
            customerId = _state.value.session.userId,
            customerName = _state.value.session.fullName,
            customerPhone = _state.value.session.phoneNumber,
            serviceCategoryId = profession.id,
            serviceCategoryName = profession.name,
            serviceDescription = description.ifBlank { "${profession.name} inspection & repair" },
            isUrgent = isUrgent,
            estimatedHours = estimatedHours.coerceIn(1, 10),
            workerBaseCharge = baseCharge,
            urgentSurcharge = urgentFee,
            platformFee = platformFee,
            totalAmount = total,
            addressLine = addressLine.ifBlank { "Sector 100" },
            locality = locality.ifBlank { "Sector 100" },
            city = city.ifBlank { "Noida" },
            pincode = pincode.ifBlank { "201304" },
            customerLatitude = 28.5355,
            customerLongitude = 77.3910,
            status = if (preWorker != null) BookingStatus.ACCEPTED else BookingStatus.REQUESTED,
            assignedWorkerId = preWorker?.id,
            assignedWorkerName = preWorker?.fullName,
            assignedWorkerPhone = preWorker?.phoneNumber,
            createdAt = nowStamp()
        )

        val feeEntry = PlatformFeeEntry(
            id = "pf-${System.currentTimeMillis() % 100000}",
            bookingId = booking.id,
            serviceCategory = booking.serviceCategoryName,
            customerName = booking.customerName,
            workerName = booking.assignedWorkerName ?: "Assigning...",
            baseWorkerCharge = baseCharge,
            platformFee = platformFee,
            totalCustomerPayment = total,
            settlementStatus = "PENDING",
            createdAt = booking.createdAt
        )

        updateAndSave { s ->
            s.copy(
                bookings = listOf(booking) + s.bookings,
                platformFees = listOf(feeEntry) + s.platformFees
            )
        }
        return booking
    }

    fun toggleWorkerOnline(workerId: String = "worker-prof-1"): Boolean {
        var newState = true
        updateAndSave { s ->
            val updated = s.workers.map { w ->
                if (w.id == workerId) {
                    newState = !w.isOnline
                    w.copy(isOnline = newState)
                } else w
            }
            s.copy(workers = updated)
        }
        return newState
    }

    fun acceptBooking(bookingId: String, workerId: String = "worker-prof-1"): Result<Booking> {
        val current = _state.value
        val hasActive = current.bookings.any {
            it.assignedWorkerId == workerId &&
                it.status in setOf(
                    BookingStatus.ACCEPTED,
                    BookingStatus.WORKER_ON_THE_WAY,
                    BookingStatus.ARRIVED,
                    BookingStatus.WORK_STARTED
                )
        }
        if (hasActive) {
            return Result.failure(IllegalStateException("Finish your active job before accepting another request."))
        }
        val worker = current.workers.firstOrNull { it.id == workerId } ?: current.workers.first()
        var accepted: Booking? = null
        updateAndSave { s ->
            val updatedBookings = s.bookings.map { b ->
                if (b.id == bookingId && b.status == BookingStatus.REQUESTED) {
                    val nb = b.copy(
                        status = BookingStatus.ACCEPTED,
                        assignedWorkerId = worker.id,
                        assignedWorkerName = worker.fullName,
                        assignedWorkerPhone = worker.phoneNumber
                    )
                    accepted = nb
                    nb
                } else b
            }
            val updatedFees = s.platformFees.map { f ->
                if (f.bookingId == bookingId) f.copy(workerName = worker.fullName) else f
            }
            s.copy(bookings = updatedBookings, platformFees = updatedFees)
        }
        return accepted?.let { Result.success(it) }
            ?: Result.failure(IllegalStateException("Booking is no longer available."))
    }

    fun declineBooking(bookingId: String) {
        updateAndSave { s ->
            s.copy(
                bookings = s.bookings.map { b ->
                    if (b.id == bookingId && b.status == BookingStatus.REQUESTED) {
                        b.copy(status = BookingStatus.CANCELLED)
                    } else b
                }
            )
        }
    }

    fun advanceBookingStatus(bookingId: String, newStatus: BookingStatus, notes: String? = null) {
        updateAndSave { s ->
            s.copy(
                bookings = s.bookings.map { b ->
                    if (b.id == bookingId) {
                        b.copy(
                            status = newStatus,
                            beforeWorkNotes = if (newStatus == BookingStatus.WORK_STARTED && !notes.isNullOrBlank()) notes else b.beforeWorkNotes,
                            afterWorkNotes = if (newStatus == BookingStatus.WORK_COMPLETED && !notes.isNullOrBlank()) notes else b.afterWorkNotes
                        )
                    } else b
                }
            )
        }
    }

    fun confirmAndPayBooking(bookingId: String): Int {
        var netCredited = 0
        updateAndSave { s ->
            val target = s.bookings.firstOrNull { it.id == bookingId } ?: return@updateAndSave s
            if (target.status == BookingStatus.PAYMENT_PAID) return@updateAndSave s

            val grossWorker = target.workerBaseCharge
            val commission = (grossWorker * 0.10).toInt()
            netCredited = grossWorker - commission

            val updatedBookings = s.bookings.map {
                if (it.id == bookingId) it.copy(status = BookingStatus.PAYMENT_PAID) else it
            }
            val updatedFees = s.platformFees.map {
                if (it.bookingId == bookingId) it.copy(settlementStatus = "SETTLED") else it
            }
            val updatedWorkers = s.workers.map { w ->
                if (w.id == target.assignedWorkerId) {
                    w.copy(completedJobsCount = w.completedJobsCount + 1)
                } else w
            }
            val newTx = WalletLedgerEntry(
                id = "tx-${System.currentTimeMillis() % 100000}",
                transactionType = "JOB_EARNING",
                description = "${target.serviceCategoryName} #${target.id}",
                grossAmount = grossWorker,
                commissionAmount = commission,
                netAmount = netCredited,
                status = "COMPLETED",
                createdAt = nowStamp()
            )
            val w = s.wallet
            val updatedWallet = w.copy(
                availableBalance = w.availableBalance + netCredited,
                todayEarnings = w.todayEarnings + netCredited,
                weekEarnings = w.weekEarnings + netCredited,
                monthEarnings = w.monthEarnings + netCredited,
                lifetimeEarnings = w.lifetimeEarnings + netCredited,
                commissionDeductions = w.commissionDeductions + commission,
                totalCompletedJobs = w.totalCompletedJobs + 1
            )
            s.copy(
                bookings = updatedBookings,
                platformFees = updatedFees,
                workers = updatedWorkers,
                wallet = updatedWallet,
                ledgerEntries = listOf(newTx) + s.ledgerEntries
            )
        }
        return netCredited
    }

    fun submitReview(bookingId: String, quality: Int, timeliness: Int, behaviour: Int, comment: String) {
        val avg = ((quality + timeliness + behaviour) / 3.0)
        val rounded = kotlin.math.round(avg * 10.0) / 10.0
        val review = JobReview(
            id = "rev-${System.currentTimeMillis() % 100000}",
            bookingId = bookingId,
            ratingQuality = quality,
            ratingTimeliness = timeliness,
            ratingBehaviour = behaviour,
            ratingOverall = rounded,
            comment = comment.ifBlank { "Verified service completed smoothly." },
            createdAt = nowStamp()
        )
        updateAndSave { s ->
            val target = s.bookings.firstOrNull { it.id == bookingId }
            val updatedBookings = s.bookings.map { b ->
                if (b.id == bookingId) b.copy(review = review) else b
            }
            val updatedWorkers = s.workers.map { w ->
                if (w.id == target?.assignedWorkerId) {
                    val newCount = w.ratingCount + 1
                    val newAvg = kotlin.math.round(((w.ratingAvg * w.ratingCount + rounded) / newCount) * 10.0) / 10.0
                    w.copy(ratingAvg = newAvg, ratingCount = newCount)
                } else w
            }
            s.copy(bookings = updatedBookings, workers = updatedWorkers)
        }
    }

    fun raiseDispute(bookingId: String, reason: String, description: String) {
        val booking = _state.value.bookings.firstOrNull { it.id == bookingId } ?: return
        val dispute = JobDispute(
            id = "dsp-${System.currentTimeMillis() % 100000}",
            bookingId = bookingId,
            customerName = booking.customerName,
            reason = reason,
            description = description.ifBlank { "Quality or pricing clarification requested." },
            status = DisputeStatus.OPEN,
            createdAt = nowStamp()
        )
        updateAndSave { s ->
            s.copy(
                disputes = listOf(dispute) + s.disputes,
                bookings = s.bookings.map { b ->
                    if (b.id == bookingId) b.copy(disputeId = dispute.id, status = BookingStatus.DISPUTED) else b
                }
            )
        }
    }

    fun resolveDispute(disputeId: String, refundApproved: Boolean, notes: String) {
        val status = if (refundApproved) DisputeStatus.RESOLVED_REFUND else DisputeStatus.RESOLVED_DISMISSED
        updateAndSave { s ->
            val target = s.disputes.firstOrNull { it.id == disputeId }
            val updatedDisputes = s.disputes.map { d ->
                if (d.id == disputeId) d.copy(status = status, resolutionNotes = notes.ifBlank { "Resolved by Super Admin." }) else d
            }
            val updatedFees = if (refundApproved && target != null) {
                s.platformFees.map { f ->
                    if (f.bookingId == target.bookingId) f.copy(settlementStatus = "REFUNDED") else f
                }
            } else s.platformFees
            s.copy(disputes = updatedDisputes, platformFees = updatedFees)
        }
    }

    fun requestWithdrawal(amount: Int, payoutAccountId: String): Result<WithdrawalRequest> {
        val current = _state.value
        if (amount < 100) {
            return Result.failure(IllegalArgumentException("Minimum withdrawal amount is ₹100."))
        }
        if (amount > current.wallet.availableBalance) {
            return Result.failure(IllegalArgumentException("Insufficient available balance (₹${current.wallet.availableBalance})."))
        }
        val account = current.payoutAccounts.firstOrNull { it.id == payoutAccountId }
            ?: return Result.failure(IllegalArgumentException("Select a verified payout account."))

        val label = if (account.accountType == "BANK_ACCOUNT") {
            "${account.bankName ?: "Bank"} (${account.maskedTarget})"
        } else {
            account.maskedTarget
        }

        val req = WithdrawalRequest(
            id = "wdr-${System.currentTimeMillis() % 100000}",
            workerName = current.workers.first().fullName,
            workerPhone = current.workers.first().phoneNumber,
            payoutTargetMasked = label,
            payoutMethod = account.accountType,
            amount = amount,
            fee = 0,
            netPayout = amount,
            status = WithdrawalStatus.REQUESTED,
            requestedAt = nowStamp()
        )
        val ledgerTx = WalletLedgerEntry(
            id = "tx-${System.currentTimeMillis() % 100000}",
            transactionType = "WITHDRAWAL_REQUEST",
            description = "Locked for payout to $label",
            grossAmount = amount,
            commissionAmount = 0,
            netAmount = -amount,
            status = "PENDING",
            createdAt = nowStamp()
        )

        updateAndSave { s ->
            s.copy(
                wallet = s.wallet.copy(
                    availableBalance = s.wallet.availableBalance - amount,
                    reservedBalance = s.wallet.reservedBalance + amount
                ),
                withdrawals = listOf(req) + s.withdrawals,
                ledgerEntries = listOf(ledgerTx) + s.ledgerEntries
            )
        }
        return Result.success(req)
    }

    fun addPayoutAccount(
        accountType: String,
        holderName: String,
        bankName: String?,
        accountNumberOrUpi: String,
        ifscCode: String?
    ): PayoutAccount {
        val masked = if (accountType == "BANK_ACCOUNT") {
            "•••• •••• ${accountNumberOrUpi.takeLast(4).padStart(4, '0')}"
        } else {
            accountNumberOrUpi.trim()
        }
        val acc = PayoutAccount(
            id = "pa-${System.currentTimeMillis() % 100000}",
            accountType = accountType,
            accountHolderName = holderName.ifBlank { "Rajesh Sharma" },
            bankName = if (accountType == "BANK_ACCOUNT") (bankName?.ifBlank { "SBI" } ?: "SBI") else null,
            maskedTarget = masked,
            ifscCode = if (accountType == "BANK_ACCOUNT") ifscCode?.uppercase() else null,
            isPrimary = _state.value.payoutAccounts.isEmpty()
        )
        updateAndSave { s -> s.copy(payoutAccounts = s.payoutAccounts + acc) }
        return acc
    }

    fun reviewWithdrawal(withdrawalId: String, approve: Boolean, utrOrReason: String) {
        updateAndSave { s ->
            val target = s.withdrawals.firstOrNull { it.id == withdrawalId } ?: return@updateAndSave s
            if (target.status != WithdrawalStatus.REQUESTED && target.status != WithdrawalStatus.PROCESSING) {
                return@updateAndSave s
            }
            val updatedWdr = s.withdrawals.map { w ->
                if (w.id == withdrawalId) {
                    if (approve) {
                        w.copy(
                            status = WithdrawalStatus.COMPLETED,
                            bankTransferReference = utrOrReason.ifBlank { "UTR${System.currentTimeMillis() % 100000000}" }
                        )
                    } else {
                        w.copy(
                            status = WithdrawalStatus.REJECTED,
                            failureReason = utrOrReason.ifBlank { "Rejected by Finance Admin" }
                        )
                    }
                } else w
            }
            val updatedWallet = if (approve) {
                s.wallet.copy(
                    reservedBalance = (s.wallet.reservedBalance - target.amount).coerceAtLeast(0),
                    totalWithdrawn = s.wallet.totalWithdrawn + target.amount
                )
            } else {
                s.wallet.copy(
                    reservedBalance = (s.wallet.reservedBalance - target.amount).coerceAtLeast(0),
                    availableBalance = s.wallet.availableBalance + target.amount
                )
            }
            val auditTx = WalletLedgerEntry(
                id = "tx-${System.currentTimeMillis() % 100000}",
                transactionType = if (approve) "WITHDRAWAL_SUCCESS" else "WITHDRAWAL_FAILED",
                description = if (approve) {
                    "Settled ${target.payoutTargetMasked} (Ref: ${utrOrReason.ifBlank { "UTR" }})"
                } else {
                    "Reversed to wallet: ${utrOrReason.ifBlank { "Admin rejected" }}"
                },
                grossAmount = target.amount,
                commissionAmount = 0,
                netAmount = if (approve) 0 else target.amount,
                status = if (approve) "COMPLETED" else "REVERSED",
                createdAt = nowStamp()
            )
            s.copy(
                withdrawals = updatedWdr,
                wallet = updatedWallet,
                ledgerEntries = listOf(auditTx) + s.ledgerEntries
            )
        }
    }

    fun reviewKyc(workerId: String, approve: Boolean, reason: String?) {
        updateAndSave { s ->
            s.copy(
                workers = s.workers.map { w ->
                    if (w.id == workerId) {
                        w.copy(
                            verificationStatus = if (approve) VerificationStatus.VERIFIED else VerificationStatus.REJECTED,
                            rejectionReason = if (approve) null else reason?.ifBlank { "Document unclear" }
                        )
                    } else w
                }
            )
        }
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
    ): Tender {
        val count = workerCount.coerceIn(1, 500)
        val rate = dailyRate.coerceIn(300, 5000)
        val tender = Tender(
            id = "tnd-${System.currentTimeMillis() % 100000}",
            contractorName = _state.value.session.fullName,
            categoryName = categoryName,
            title = title,
            projectName = projectName,
            description = description,
            city = city.ifBlank { "Noida" },
            state = "Uttar Pradesh",
            workerCountRequired = count,
            perWorkerRate = rate,
            totalBudget = count * rate * 30,
            accommodationProvided = accommodation,
            transportProvided = transport,
            deadline = "2026-12-20",
            status = "OPEN"
        )
        updateAndSave { s -> s.copy(tenders = listOf(tender) + s.tenders) }
        return tender
    }

    fun applyToTender(
        tenderId: String,
        applicantName: String,
        isTeamBid: Boolean,
        proposedRate: Int,
        workersCount: Int,
        coverNote: String
    ) {
        val app = TenderApplication(
            id = "tapp-${System.currentTimeMillis() % 100000}",
            tenderId = tenderId,
            applicantName = applicantName.ifBlank { _state.value.session.fullName },
            isTeamBid = isTeamBid,
            proposedRate = proposedRate.coerceAtLeast(300),
            proposedWorkersCount = workersCount.coerceAtLeast(1),
            coverNote = coverNote.ifBlank { "Experienced crew ready for site mobilization." },
            status = TenderApplicationStatus.APPLIED,
            appliedAt = nowStamp()
        )
        updateAndSave { s -> s.copy(tenderApplications = listOf(app) + s.tenderApplications) }
    }

    fun updateTenderApplicationStatus(appId: String, status: TenderApplicationStatus) {
        updateAndSave { s ->
            s.copy(
                tenderApplications = s.tenderApplications.map { a ->
                    if (a.id == appId) a.copy(status = status) else a
                }
            )
        }
    }

    // --- JSON Persistence ---

    private fun persist(state: DigiWorkState) {
        try {
            val root = JSONObject().apply {
                put("session", JSONObject().apply {
                    put("userId", state.session.userId)
                    put("fullName", state.session.fullName)
                    put("phoneNumber", state.session.phoneNumber)
                    put("activeRole", state.session.activeRole.name)
                    put("city", state.session.city)
                })
                put("workers", JSONArray().apply {
                    state.workers.forEach { w ->
                        put(JSONObject().apply {
                            put("id", w.id)
                            put("userId", w.userId)
                            put("fullName", w.fullName)
                            put("phoneNumber", w.phoneNumber)
                            put("headline", w.headline)
                            put("primaryCategoryId", w.primaryCategoryId)
                            put("primaryCategoryName", w.primaryCategoryName)
                            put("skills", JSONArray(w.skills))
                            put("experienceYears", w.experienceYears)
                            put("hourlyRate", w.hourlyRate)
                            put("dailyRate", w.dailyRate)
                            put("verificationStatus", w.verificationStatus.name)
                            put("kycDocumentSummary", w.kycDocumentSummary)
                            put("rejectionReason", w.rejectionReason ?: JSONObject.NULL)
                            put("isOnline", w.isOnline)
                            put("ratingAvg", w.ratingAvg)
                            put("ratingCount", w.ratingCount)
                            put("completedJobsCount", w.completedJobsCount)
                            put("locality", w.locality)
                            put("city", w.city)
                            put("state", w.state)
                            put("latitude", w.latitude)
                            put("longitude", w.longitude)
                        })
                    }
                })
                put("bookings", JSONArray().apply {
                    state.bookings.forEach { b ->
                        put(JSONObject().apply {
                            put("id", b.id)
                            put("customerId", b.customerId)
                            put("customerName", b.customerName)
                            put("customerPhone", b.customerPhone)
                            put("serviceCategoryId", b.serviceCategoryId)
                            put("serviceCategoryName", b.serviceCategoryName)
                            put("serviceDescription", b.serviceDescription)
                            put("isUrgent", b.isUrgent)
                            put("estimatedHours", b.estimatedHours)
                            put("workerBaseCharge", b.workerBaseCharge)
                            put("urgentSurcharge", b.urgentSurcharge)
                            put("platformFee", b.platformFee)
                            put("totalAmount", b.totalAmount)
                            put("addressLine", b.addressLine)
                            put("locality", b.locality)
                            put("city", b.city)
                            put("pincode", b.pincode)
                            put("customerLatitude", b.customerLatitude)
                            put("customerLongitude", b.customerLongitude)
                            put("status", b.status.name)
                            put("assignedWorkerId", b.assignedWorkerId ?: JSONObject.NULL)
                            put("assignedWorkerName", b.assignedWorkerName ?: JSONObject.NULL)
                            put("assignedWorkerPhone", b.assignedWorkerPhone ?: JSONObject.NULL)
                            put("beforeWorkNotes", b.beforeWorkNotes ?: JSONObject.NULL)
                            put("afterWorkNotes", b.afterWorkNotes ?: JSONObject.NULL)
                            put("disputeId", b.disputeId ?: JSONObject.NULL)
                            put("createdAt", b.createdAt)
                            b.review?.let { r ->
                                put("review", JSONObject().apply {
                                    put("id", r.id)
                                    put("bookingId", r.bookingId)
                                    put("ratingQuality", r.ratingQuality)
                                    put("ratingTimeliness", r.ratingTimeliness)
                                    put("ratingBehaviour", r.ratingBehaviour)
                                    put("ratingOverall", r.ratingOverall)
                                    put("comment", r.comment)
                                    put("createdAt", r.createdAt)
                                })
                            }
                        })
                    }
                })
                put("wallet", JSONObject().apply {
                    put("availableBalance", state.wallet.availableBalance)
                    put("reservedBalance", state.wallet.reservedBalance)
                    put("todayEarnings", state.wallet.todayEarnings)
                    put("weekEarnings", state.wallet.weekEarnings)
                    put("monthEarnings", state.wallet.monthEarnings)
                    put("lifetimeEarnings", state.wallet.lifetimeEarnings)
                    put("totalWithdrawn", state.wallet.totalWithdrawn)
                    put("commissionDeductions", state.wallet.commissionDeductions)
                    put("commissionPayable", state.wallet.commissionPayable)
                    put("totalCompletedJobs", state.wallet.totalCompletedJobs)
                })
                put("withdrawals", JSONArray().apply {
                    state.withdrawals.forEach { w ->
                        put(JSONObject().apply {
                            put("id", w.id)
                            put("workerName", w.workerName)
                            put("workerPhone", w.workerPhone)
                            put("payoutTargetMasked", w.payoutTargetMasked)
                            put("payoutMethod", w.payoutMethod)
                            put("amount", w.amount)
                            put("fee", w.fee)
                            put("netPayout", w.netPayout)
                            put("status", w.status.name)
                            put("bankTransferReference", w.bankTransferReference ?: JSONObject.NULL)
                            put("failureReason", w.failureReason ?: JSONObject.NULL)
                            put("requestedAt", w.requestedAt)
                        })
                    }
                })
                put("tenders", JSONArray().apply {
                    state.tenders.forEach { t ->
                        put(JSONObject().apply {
                            put("id", t.id)
                            put("contractorName", t.contractorName)
                            put("categoryName", t.categoryName)
                            put("title", t.title)
                            put("projectName", t.projectName)
                            put("description", t.description)
                            put("city", t.city)
                            put("state", t.state)
                            put("workerCountRequired", t.workerCountRequired)
                            put("perWorkerRate", t.perWorkerRate)
                            put("totalBudget", t.totalBudget)
                            put("accommodationProvided", t.accommodationProvided)
                            put("transportProvided", t.transportProvided)
                            put("deadline", t.deadline)
                            put("status", t.status)
                        })
                    }
                })
                put("tenderApplications", JSONArray().apply {
                    state.tenderApplications.forEach { a ->
                        put(JSONObject().apply {
                            put("id", a.id)
                            put("tenderId", a.tenderId)
                            put("applicantName", a.applicantName)
                            put("isTeamBid", a.isTeamBid)
                            put("proposedRate", a.proposedRate)
                            put("proposedWorkersCount", a.proposedWorkersCount)
                            put("coverNote", a.coverNote)
                            put("status", a.status.name)
                            put("appliedAt", a.appliedAt)
                        })
                    }
                })
                put("platformFees", JSONArray().apply {
                    state.platformFees.forEach { f ->
                        put(JSONObject().apply {
                            put("id", f.id)
                            put("bookingId", f.bookingId)
                            put("serviceCategory", f.serviceCategory)
                            put("customerName", f.customerName)
                            put("workerName", f.workerName)
                            put("baseWorkerCharge", f.baseWorkerCharge)
                            put("platformFee", f.platformFee)
                            put("totalCustomerPayment", f.totalCustomerPayment)
                            put("settlementStatus", f.settlementStatus)
                            put("createdAt", f.createdAt)
                        })
                    }
                })
                put("disputes", JSONArray().apply {
                    state.disputes.forEach { d ->
                        put(JSONObject().apply {
                            put("id", d.id)
                            put("bookingId", d.bookingId)
                            put("customerName", d.customerName)
                            put("reason", d.reason)
                            put("description", d.description)
                            put("status", d.status.name)
                            put("resolutionNotes", d.resolutionNotes ?: JSONObject.NULL)
                            put("createdAt", d.createdAt)
                        })
                    }
                })
                put("ledgerEntries", JSONArray().apply {
                    state.ledgerEntries.forEach { e ->
                        put(JSONObject().apply {
                            put("id", e.id)
                            put("transactionType", e.transactionType)
                            put("description", e.description)
                            put("grossAmount", e.grossAmount)
                            put("commissionAmount", e.commissionAmount)
                            put("netAmount", e.netAmount)
                            put("status", e.status)
                            put("createdAt", e.createdAt)
                        })
                    }
                })
                put("payoutAccounts", JSONArray().apply {
                    state.payoutAccounts.forEach { p ->
                        put(JSONObject().apply {
                            put("id", p.id)
                            put("accountType", p.accountType)
                            put("accountHolderName", p.accountHolderName)
                            put("bankName", p.bankName ?: JSONObject.NULL)
                            put("maskedTarget", p.maskedTarget)
                            put("ifscCode", p.ifscCode ?: JSONObject.NULL)
                            put("isPrimary", p.isPrimary)
                        })
                    }
                })
            }
            storeFile.writeText(root.toString())
        } catch (_: Exception) {
        }
    }

    private fun decodeState(root: JSONObject): DigiWorkState {
        val sessObj = root.getJSONObject("session")
        val session = UserSession(
            userId = sessObj.getString("userId"),
            fullName = sessObj.getString("fullName"),
            phoneNumber = sessObj.getString("phoneNumber"),
            activeRole = UserRole.valueOf(sessObj.getString("activeRole")),
            city = sessObj.getString("city")
        )

        val workersArr = root.getJSONArray("workers")
        val workers = (0 until workersArr.length()).map { i ->
            val o = workersArr.getJSONObject(i)
            val skillsArr = o.getJSONArray("skills")
            WorkerProfile(
                id = o.getString("id"),
                userId = o.getString("userId"),
                fullName = o.getString("fullName"),
                phoneNumber = o.getString("phoneNumber"),
                headline = o.getString("headline"),
                primaryCategoryId = o.getString("primaryCategoryId"),
                primaryCategoryName = o.getString("primaryCategoryName"),
                skills = (0 until skillsArr.length()).map { skillsArr.getString(it) },
                experienceYears = o.getInt("experienceYears"),
                hourlyRate = o.getInt("hourlyRate"),
                dailyRate = o.getInt("dailyRate"),
                verificationStatus = VerificationStatus.valueOf(o.getString("verificationStatus")),
                kycDocumentSummary = o.getString("kycDocumentSummary"),
                rejectionReason = o.optString("rejectionReason").takeIf { it.isNotBlank() && it != "null" },
                isOnline = o.getBoolean("isOnline"),
                ratingAvg = o.getDouble("ratingAvg"),
                ratingCount = o.getInt("ratingCount"),
                completedJobsCount = o.getInt("completedJobsCount"),
                locality = o.getString("locality"),
                city = o.getString("city"),
                state = o.getString("state"),
                latitude = o.getDouble("latitude"),
                longitude = o.getDouble("longitude")
            )
        }

        val bookingsArr = root.getJSONArray("bookings")
        val bookings = (0 until bookingsArr.length()).map { i ->
            val o = bookingsArr.getJSONObject(i)
            val revObj = o.optJSONObject("review")
            Booking(
                id = o.getString("id"),
                customerId = o.getString("customerId"),
                customerName = o.getString("customerName"),
                customerPhone = o.getString("customerPhone"),
                serviceCategoryId = o.getString("serviceCategoryId"),
                serviceCategoryName = o.getString("serviceCategoryName"),
                serviceDescription = o.getString("serviceDescription"),
                isUrgent = o.getBoolean("isUrgent"),
                estimatedHours = o.getInt("estimatedHours"),
                workerBaseCharge = o.getInt("workerBaseCharge"),
                urgentSurcharge = o.getInt("urgentSurcharge"),
                platformFee = o.getInt("platformFee"),
                totalAmount = o.getInt("totalAmount"),
                addressLine = o.getString("addressLine"),
                locality = o.getString("locality"),
                city = o.getString("city"),
                pincode = o.getString("pincode"),
                customerLatitude = o.getDouble("customerLatitude"),
                customerLongitude = o.getDouble("customerLongitude"),
                status = BookingStatus.valueOf(o.getString("status")),
                assignedWorkerId = o.optString("assignedWorkerId").takeIf { it.isNotBlank() && it != "null" },
                assignedWorkerName = o.optString("assignedWorkerName").takeIf { it.isNotBlank() && it != "null" },
                assignedWorkerPhone = o.optString("assignedWorkerPhone").takeIf { it.isNotBlank() && it != "null" },
                beforeWorkNotes = o.optString("beforeWorkNotes").takeIf { it.isNotBlank() && it != "null" },
                afterWorkNotes = o.optString("afterWorkNotes").takeIf { it.isNotBlank() && it != "null" },
                disputeId = o.optString("disputeId").takeIf { it.isNotBlank() && it != "null" },
                createdAt = o.getString("createdAt"),
                review = revObj?.let { r ->
                    JobReview(
                        id = r.getString("id"),
                        bookingId = r.getString("bookingId"),
                        ratingQuality = r.getInt("ratingQuality"),
                        ratingTimeliness = r.getInt("ratingTimeliness"),
                        ratingBehaviour = r.getInt("ratingBehaviour"),
                        ratingOverall = r.getDouble("ratingOverall"),
                        comment = r.getString("comment"),
                        createdAt = r.getString("createdAt")
                    )
                }
            )
        }

        val wObj = root.getJSONObject("wallet")
        val wallet = WorkerWallet(
            availableBalance = wObj.getInt("availableBalance"),
            reservedBalance = wObj.getInt("reservedBalance"),
            todayEarnings = wObj.getInt("todayEarnings"),
            weekEarnings = wObj.getInt("weekEarnings"),
            monthEarnings = wObj.getInt("monthEarnings"),
            lifetimeEarnings = wObj.getInt("lifetimeEarnings"),
            totalWithdrawn = wObj.getInt("totalWithdrawn"),
            commissionDeductions = wObj.getInt("commissionDeductions"),
            commissionPayable = wObj.getInt("commissionPayable"),
            totalCompletedJobs = wObj.getInt("totalCompletedJobs")
        )

        val wdrArr = root.getJSONArray("withdrawals")
        val withdrawals = (0 until wdrArr.length()).map { i ->
            val o = wdrArr.getJSONObject(i)
            WithdrawalRequest(
                id = o.getString("id"),
                workerName = o.getString("workerName"),
                workerPhone = o.getString("workerPhone"),
                payoutTargetMasked = o.getString("payoutTargetMasked"),
                payoutMethod = o.getString("payoutMethod"),
                amount = o.getInt("amount"),
                fee = o.getInt("fee"),
                netPayout = o.getInt("netPayout"),
                status = WithdrawalStatus.valueOf(o.getString("status")),
                bankTransferReference = o.optString("bankTransferReference").takeIf { it.isNotBlank() && it != "null" },
                failureReason = o.optString("failureReason").takeIf { it.isNotBlank() && it != "null" },
                requestedAt = o.getString("requestedAt")
            )
        }

        val tArr = root.getJSONArray("tenders")
        val tenders = (0 until tArr.length()).map { i ->
            val o = tArr.getJSONObject(i)
            Tender(
                id = o.getString("id"),
                contractorName = o.getString("contractorName"),
                categoryName = o.getString("categoryName"),
                title = o.getString("title"),
                projectName = o.getString("projectName"),
                description = o.getString("description"),
                city = o.getString("city"),
                state = o.getString("state"),
                workerCountRequired = o.getInt("workerCountRequired"),
                perWorkerRate = o.getInt("perWorkerRate"),
                totalBudget = o.getInt("totalBudget"),
                accommodationProvided = o.getBoolean("accommodationProvided"),
                transportProvided = o.getBoolean("transportProvided"),
                deadline = o.getString("deadline"),
                status = o.getString("status")
            )
        }

        val taArr = root.getJSONArray("tenderApplications")
        val tenderApps = (0 until taArr.length()).map { i ->
            val o = taArr.getJSONObject(i)
            TenderApplication(
                id = o.getString("id"),
                tenderId = o.getString("tenderId"),
                applicantName = o.getString("applicantName"),
                isTeamBid = o.getBoolean("isTeamBid"),
                proposedRate = o.getInt("proposedRate"),
                proposedWorkersCount = o.getInt("proposedWorkersCount"),
                coverNote = o.getString("coverNote"),
                status = TenderApplicationStatus.valueOf(o.getString("status")),
                appliedAt = o.getString("appliedAt")
            )
        }

        val pfArr = root.getJSONArray("platformFees")
        val platformFees = (0 until pfArr.length()).map { i ->
            val o = pfArr.getJSONObject(i)
            PlatformFeeEntry(
                id = o.getString("id"),
                bookingId = o.getString("bookingId"),
                serviceCategory = o.getString("serviceCategory"),
                customerName = o.getString("customerName"),
                workerName = o.getString("workerName"),
                baseWorkerCharge = o.getInt("baseWorkerCharge"),
                platformFee = o.getInt("platformFee"),
                totalCustomerPayment = o.getInt("totalCustomerPayment"),
                settlementStatus = o.getString("settlementStatus"),
                createdAt = o.getString("createdAt")
            )
        }

        val dArr = root.getJSONArray("disputes")
        val disputes = (0 until dArr.length()).map { i ->
            val o = dArr.getJSONObject(i)
            JobDispute(
                id = o.getString("id"),
                bookingId = o.getString("bookingId"),
                customerName = o.getString("customerName"),
                reason = o.getString("reason"),
                description = o.getString("description"),
                status = DisputeStatus.valueOf(o.getString("status")),
                resolutionNotes = o.optString("resolutionNotes").takeIf { it.isNotBlank() && it != "null" },
                createdAt = o.getString("createdAt")
            )
        }

        val ledgerArr = root.optJSONArray("ledgerEntries")
        val ledgerEntries = if (ledgerArr != null) {
            (0 until ledgerArr.length()).map { i ->
                val o = ledgerArr.getJSONObject(i)
                WalletLedgerEntry(
                    id = o.getString("id"),
                    transactionType = o.getString("transactionType"),
                    description = o.getString("description"),
                    grossAmount = o.getInt("grossAmount"),
                    commissionAmount = o.getInt("commissionAmount"),
                    netAmount = o.getInt("netAmount"),
                    status = o.getString("status"),
                    createdAt = o.getString("createdAt")
                )
            }
        } else SeedData.defaultLedger

        val paArr = root.optJSONArray("payoutAccounts")
        val payoutAccounts = if (paArr != null) {
            (0 until paArr.length()).map { i ->
                val o = paArr.getJSONObject(i)
                PayoutAccount(
                    id = o.getString("id"),
                    accountType = o.getString("accountType"),
                    accountHolderName = o.getString("accountHolderName"),
                    bankName = o.optString("bankName").takeIf { it.isNotBlank() && it != "null" },
                    maskedTarget = o.getString("maskedTarget"),
                    ifscCode = o.optString("ifscCode").takeIf { it.isNotBlank() && it != "null" },
                    isPrimary = o.getBoolean("isPrimary")
                )
            }
        } else SeedData.defaultPayoutAccounts

        return DigiWorkState(
            session = session,
            workers = workers,
            bookings = bookings,
            tenders = tenders,
            tenderApplications = tenderApps,
            wallet = wallet,
            ledgerEntries = ledgerEntries,
            payoutAccounts = payoutAccounts,
            withdrawals = withdrawals,
            platformFees = platformFees,
            disputes = disputes
        )
    }
}
