package com.example.data

enum class UserRole(val label: String, val labelHi: String) {
    CUSTOMER("Hiring Partner", "ग्राहक"),
    WORKER("Worker Fleet", "श्रमिक"),
    CONTRACTOR("Contractor", "ठेकेदार"),
    ADMIN("Super Admin", "प्रशासक")
}

enum class VerificationStatus {
    UNVERIFIED,
    SUBMITTED,
    UNDER_REVIEW,
    VERIFIED,
    REJECTED
}

enum class BookingStatus(val label: String, val stepIndex: Int) {
    REQUESTED("Requested", 0),
    ACCEPTED("Accepted", 1),
    WORKER_ON_THE_WAY("On The Way", 2),
    ARRIVED("Arrived", 3),
    WORK_STARTED("Work Started", 4),
    WORK_COMPLETED("Completed", 5),
    CUSTOMER_CONFIRMED("Confirmed", 5),
    PAYMENT_PAID("Paid", 6),
    CANCELLED("Cancelled", -1),
    DISPUTED("Disputed", -1)
}

enum class TenderApplicationStatus {
    APPLIED,
    SHORTLISTED,
    SELECTED,
    REJECTED
}

enum class WithdrawalStatus {
    REQUESTED,
    PROCESSING,
    COMPLETED,
    REJECTED
}

enum class DisputeStatus {
    OPEN,
    RESOLVED_REFUND,
    RESOLVED_DISMISSED
}

data class ProfessionSubcategory(
    val id: String,
    val name: String,
    val nameHi: String,
    val description: String,
    val avgPrice: String
)

data class PricingItem(
    val service: String,
    val rate: String,
    val timeEst: String,
    val description: String
)

data class Profession(
    val id: String,
    val slug: String,
    val name: String,
    val nameHi: String,
    val sector: String,
    val intro: String,
    val baseHourlyRate: Int,
    val baseDailyRate: Int,
    val workerCountEstimate: String,
    val popularSkills: List<String>,
    val subcategories: List<ProfessionSubcategory>,
    val pricingGuide: List<PricingItem>,
    val requiredTools: List<String>,
    val certifications: List<String>
)

data class UserSession(
    val userId: String,
    val fullName: String,
    val phoneNumber: String,
    val activeRole: UserRole,
    val city: String,
    val isLoggedIn: Boolean = true
)

data class WorkerProfile(
    val id: String,
    val userId: String,
    val fullName: String,
    val phoneNumber: String,
    val headline: String,
    val primaryCategoryId: String,
    val primaryCategoryName: String,
    val skills: List<String>,
    val experienceYears: Int,
    val hourlyRate: Int,
    val dailyRate: Int,
    val verificationStatus: VerificationStatus,
    val kycDocumentSummary: String,
    val rejectionReason: String? = null,
    val isOnline: Boolean,
    val ratingAvg: Double,
    val ratingCount: Int,
    val completedJobsCount: Int,
    val locality: String,
    val city: String,
    val state: String,
    val latitude: Double,
    val longitude: Double
)

data class JobReview(
    val id: String,
    val bookingId: String,
    val ratingQuality: Int,
    val ratingTimeliness: Int,
    val ratingBehaviour: Int,
    val ratingOverall: Double,
    val comment: String,
    val createdAt: String
)

data class JobDispute(
    val id: String,
    val bookingId: String,
    val customerName: String,
    val reason: String,
    val description: String,
    val status: DisputeStatus,
    val resolutionNotes: String? = null,
    val createdAt: String
)

data class Booking(
    val id: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val serviceCategoryId: String,
    val serviceCategoryName: String,
    val serviceDescription: String,
    val isUrgent: Boolean,
    val estimatedHours: Int,
    val workerBaseCharge: Int,
    val urgentSurcharge: Int,
    val platformFee: Int = 99,
    val totalAmount: Int,
    val addressLine: String,
    val locality: String,
    val city: String,
    val pincode: String,
    val customerLatitude: Double,
    val customerLongitude: Double,
    val status: BookingStatus,
    val assignedWorkerId: String? = null,
    val assignedWorkerName: String? = null,
    val assignedWorkerPhone: String? = null,
    val beforeWorkNotes: String? = null,
    val afterWorkNotes: String? = null,
    val review: JobReview? = null,
    val disputeId: String? = null,
    val createdAt: String
)

data class Tender(
    val id: String,
    val contractorName: String,
    val categoryName: String,
    val title: String,
    val projectName: String,
    val description: String,
    val city: String,
    val state: String,
    val workerCountRequired: Int,
    val perWorkerRate: Int,
    val totalBudget: Int,
    val accommodationProvided: Boolean,
    val transportProvided: Boolean,
    val deadline: String,
    val status: String
)

data class TenderApplication(
    val id: String,
    val tenderId: String,
    val applicantName: String,
    val isTeamBid: Boolean,
    val proposedRate: Int,
    val proposedWorkersCount: Int,
    val coverNote: String,
    val status: TenderApplicationStatus,
    val appliedAt: String
)

data class WorkerWallet(
    val availableBalance: Int,
    val reservedBalance: Int,
    val todayEarnings: Int,
    val weekEarnings: Int,
    val monthEarnings: Int,
    val lifetimeEarnings: Int,
    val totalWithdrawn: Int,
    val commissionDeductions: Int,
    val commissionPayable: Int,
    val totalCompletedJobs: Int
)

data class WalletLedgerEntry(
    val id: String,
    val transactionType: String,
    val description: String,
    val grossAmount: Int,
    val commissionAmount: Int,
    val netAmount: Int,
    val status: String,
    val createdAt: String
)

data class PayoutAccount(
    val id: String,
    val accountType: String, // BANK_ACCOUNT or UPI
    val accountHolderName: String,
    val bankName: String?,
    val maskedTarget: String,
    val ifscCode: String?,
    val isPrimary: Boolean
)

data class WithdrawalRequest(
    val id: String,
    val workerName: String,
    val workerPhone: String,
    val payoutTargetMasked: String,
    val payoutMethod: String,
    val amount: Int,
    val fee: Int,
    val netPayout: Int,
    val status: WithdrawalStatus,
    val bankTransferReference: String? = null,
    val failureReason: String? = null,
    val requestedAt: String
)

data class PlatformFeeEntry(
    val id: String,
    val bookingId: String,
    val serviceCategory: String,
    val customerName: String,
    val workerName: String,
    val baseWorkerCharge: Int,
    val platformFee: Int,
    val totalCustomerPayment: Int,
    val settlementStatus: String, // PENDING, SETTLED, REFUNDED
    val createdAt: String
)
