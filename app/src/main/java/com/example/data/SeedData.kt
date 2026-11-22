package com.example.data

object SeedData {
    val defaultWorkers = listOf(
        WorkerProfile(
            id = "worker-prof-1",
            userId = "user-worker-1",
            fullName = "Rajesh Sharma",
            phoneNumber = "9876543210",
            headline = "Senior Electrician • ITI NCVT & Wireman Permit",
            primaryCategoryId = "cat-electrician",
            primaryCategoryName = "Electricians",
            skills = listOf("House Wiring", "MCB Box Repair", "Inverter Battery", "Short Circuit"),
            experienceYears = 9,
            hourlyRate = 350,
            dailyRate = 1100,
            verificationStatus = VerificationStatus.VERIFIED,
            kycDocumentSummary = "Aadhaar •••• 4821 & ITI Trade Cert",
            isOnline = true,
            ratingAvg = 4.9,
            ratingCount = 128,
            completedJobsCount = 312,
            locality = "Sector 62",
            city = "Noida",
            state = "Uttar Pradesh",
            latitude = 28.6279,
            longitude = 77.3649
        ),
        WorkerProfile(
            id = "worker-prof-2",
            userId = "user-worker-2",
            fullName = "Suresh Yadav",
            phoneNumber = "9876543220",
            headline = "Master Sanitary Plumber • CPVC & Diverter Expert",
            primaryCategoryId = "cat-plumber",
            primaryCategoryName = "Plumbers",
            skills = listOf("Pipe Leakage", "Diverter Repair", "Water Motor Pump", "Tank Cleaning"),
            experienceYears = 7,
            hourlyRate = 300,
            dailyRate = 950,
            verificationStatus = VerificationStatus.VERIFIED,
            kycDocumentSummary = "Aadhaar •••• 9134 & Vocational Plumbing",
            isOnline = true,
            ratingAvg = 4.8,
            ratingCount = 94,
            completedJobsCount = 245,
            locality = "Indirapuram",
            city = "Noida",
            state = "Uttar Pradesh",
            latitude = 28.6415,
            longitude = 77.3712
        ),
        WorkerProfile(
            id = "worker-prof-3",
            userId = "user-worker-3",
            fullName = "Mahesh Verma",
            phoneNumber = "9876543230",
            headline = "AC & HVAC Technician • Split AC Foam Jet & Gas Refill",
            primaryCategoryId = "cat-ac-tech",
            primaryCategoryName = "AC & Appliance Tech",
            skills = listOf("Foam Jet Service", "Gas Refill", "Split AC Install", "Inverter PCB"),
            experienceYears = 6,
            hourlyRate = 450,
            dailyRate = 1200,
            verificationStatus = VerificationStatus.VERIFIED,
            kycDocumentSummary = "Aadhaar •••• 7745 & ITI RAC Cert",
            isOnline = true,
            ratingAvg = 4.9,
            ratingCount = 76,
            completedJobsCount = 189,
            locality = "Sector 18",
            city = "Noida",
            state = "Uttar Pradesh",
            latitude = 28.5708,
            longitude = 77.3261
        ),
        WorkerProfile(
            id = "worker-prof-4",
            userId = "user-worker-4",
            fullName = "Satish Kumar",
            phoneNumber = "9876543240",
            headline = "Head Mason (Raj Mistri) & 12-Member Civil Crew",
            primaryCategoryId = "cat-mason",
            primaryCategoryName = "Masons (Raj Mistri)",
            skills = listOf("Brickwork", "Cement Plaster", "Lintel Casting", "Tile Base"),
            experienceYears = 14,
            hourlyRate = 400,
            dailyRate = 1050,
            verificationStatus = VerificationStatus.UNDER_REVIEW,
            kycDocumentSummary = "Aadhaar •••• 3019 & CSDC Card (Pending Admin Review)",
            isOnline = true,
            ratingAvg = 4.7,
            ratingCount = 62,
            completedJobsCount = 154,
            locality = "DLF Phase 3",
            city = "Gurugram",
            state = "Haryana",
            latitude = 28.4946,
            longitude = 77.0942
        ),
        WorkerProfile(
            id = "worker-prof-5",
            userId = "user-worker-5",
            fullName = "Vikram Mistri",
            phoneNumber = "9876543250",
            headline = "Modular Kitchen & Wardrobe Carpenter",
            primaryCategoryId = "cat-carpenter",
            primaryCategoryName = "Carpenters",
            skills = listOf("Modular Kitchen", "Door Locks", "Wardrobe Making", "Bed Repair"),
            experienceYears = 8,
            hourlyRate = 350,
            dailyRate = 1000,
            verificationStatus = VerificationStatus.SUBMITTED,
            kycDocumentSummary = "Aadhaar •••• 6208 & FFSC Cert (Pending Admin Review)",
            isOnline = false,
            ratingAvg = 4.6,
            ratingCount = 41,
            completedJobsCount = 97,
            locality = "Lajpat Nagar",
            city = "Delhi",
            state = "Delhi NCR",
            latitude = 28.5677,
            longitude = 77.2433
        ),
        WorkerProfile(
            id = "worker-prof-6",
            userId = "user-worker-6",
            fullName = "Arvind Chauhan",
            phoneNumber = "9876543260",
            headline = "Interior Painter & Dr. Fixit Waterproofing Expert",
            primaryCategoryId = "cat-painter",
            primaryCategoryName = "Painters",
            skills = listOf("Wall Putty", "Damp Proofing", "Luxury Emulsion", "PU Polish"),
            experienceYears = 10,
            hourlyRate = 300,
            dailyRate = 850,
            verificationStatus = VerificationStatus.VERIFIED,
            kycDocumentSummary = "Aadhaar •••• 5502 & PCSC Cert",
            isOnline = true,
            ratingAvg = 4.8,
            ratingCount = 83,
            completedJobsCount = 210,
            locality = "Gomti Nagar",
            city = "Lucknow",
            state = "Uttar Pradesh",
            latitude = 26.8467,
            longitude = 80.9462
        )
    )

    val defaultBookings = listOf(
        Booking(
            id = "bk-1001",
            customerId = "user-cust-1",
            customerName = "Ramesh Kumar",
            customerPhone = "9876543212",
            serviceCategoryId = "cat-electrician",
            serviceCategoryName = "Electricians",
            serviceDescription = "Main kitchen MCB tripping repeatedly and geyser 16A socket replacement",
            isUrgent = true,
            estimatedHours = 2,
            workerBaseCharge = 700,
            urgentSurcharge = 149,
            platformFee = 99,
            totalAmount = 948,
            addressLine = "Flat 402, Lotus Boulevard, Sector 100",
            locality = "Sector 100",
            city = "Noida",
            pincode = "201304",
            customerLatitude = 28.5355,
            customerLongitude = 77.3910,
            status = BookingStatus.WORKER_ON_THE_WAY,
            assignedWorkerId = "worker-prof-1",
            assignedWorkerName = "Rajesh Sharma",
            assignedWorkerPhone = "9876543210",
            createdAt = "2026-11-22 09:30"
        ),
        Booking(
            id = "bk-1002",
            customerId = "user-cust-1",
            customerName = "Ramesh Kumar",
            customerPhone = "9876543212",
            serviceCategoryId = "cat-plumber",
            serviceCategoryName = "Plumbers",
            serviceDescription = "Bathroom shower diverter cartridge leak and 1HP water motor priming",
            isUrgent = false,
            estimatedHours = 2,
            workerBaseCharge = 600,
            urgentSurcharge = 0,
            platformFee = 99,
            totalAmount = 699,
            addressLine = "Flat 402, Lotus Boulevard, Sector 100",
            locality = "Sector 100",
            city = "Noida",
            pincode = "201304",
            customerLatitude = 28.5355,
            customerLongitude = 77.3910,
            status = BookingStatus.REQUESTED,
            assignedWorkerId = null,
            assignedWorkerName = null,
            createdAt = "2026-11-22 10:15"
        ),
        Booking(
            id = "bk-1003",
            customerId = "user-cust-1",
            customerName = "Ramesh Kumar",
            customerPhone = "9876543212",
            serviceCategoryId = "cat-ac-tech",
            serviceCategoryName = "AC & Appliance Tech",
            serviceDescription = "1.5 Ton Split AC Foam Jet Cleaning & Drain Line Flush",
            isUrgent = false,
            estimatedHours = 1,
            workerBaseCharge = 450,
            urgentSurcharge = 0,
            platformFee = 99,
            totalAmount = 549,
            addressLine = "B-19, Sector 50",
            locality = "Sector 50",
            city = "Noida",
            pincode = "201301",
            customerLatitude = 28.5738,
            customerLongitude = 77.3621,
            status = BookingStatus.PAYMENT_PAID,
            assignedWorkerId = "worker-prof-3",
            assignedWorkerName = "Mahesh Verma",
            assignedWorkerPhone = "9876543230",
            beforeWorkNotes = "Cooling coil clogged with dust, drain pan overflowing.",
            afterWorkNotes = "Full foam jet wash completed, airflow temperature 9.2°C verified.",
            review = JobReview(
                id = "rev-101",
                bookingId = "bk-1003",
                ratingQuality = 5,
                ratingTimeliness = 5,
                ratingBehaviour = 5,
                ratingOverall = 5.0,
                comment = "Very clean foam jacket service without any water spill on walls.",
                createdAt = "2026-11-21 16:40"
            ),
            createdAt = "2026-11-21 14:00"
        )
    )

    val defaultTenders = listOf(
        Tender(
            id = "tnd-201",
            contractorName = "Apex Infra & Builders Pvt Ltd",
            categoryName = "Masons (Raj Mistri)",
            title = "Tower B Brick Masonry & External Plaster Crew (25 Workers)",
            projectName = "Godrej Woods Phase 2, Sector 43",
            description = "Need experienced raj mistris and beldar helpers for 9-inch fly ash brickwork and sponge cement plastering across floors 6 to 14.",
            city = "Noida",
            state = "Uttar Pradesh",
            workerCountRequired = 25,
            perWorkerRate = 1050,
            totalBudget = 787500,
            accommodationProvided = true,
            transportProvided = true,
            deadline = "2026-12-05",
            status = "OPEN"
        ),
        Tender(
            id = "tnd-202",
            contractorName = "Vikram Construction Co.",
            categoryName = "Electricians",
            title = "Commercial Mall Concealed Conduit & Panel Wiring Brigade",
            projectName = "CyberHub Extension Block C",
            description = "3-phase LT panel dressing, concealed PVC conduit pulling, and fire-retardant cable laying for 40 retail units.",
            city = "Gurugram",
            state = "Haryana",
            workerCountRequired = 14,
            perWorkerRate = 1150,
            totalBudget = 483000,
            accommodationProvided = false,
            transportProvided = true,
            deadline = "2026-12-12",
            status = "OPEN"
        )
    )

    val defaultTenderApps = listOf(
        TenderApplication(
            id = "tapp-301",
            tenderId = "tnd-201",
            applicantName = "Satish Kumar Masonry Brigade",
            isTeamBid = true,
            proposedRate = 1025,
            proposedWorkersCount = 15,
            coverNote = "We have 10 senior raj mistris and 5 beldars with laser spirit levels ready to mobilize within 48 hours.",
            status = TenderApplicationStatus.APPLIED,
            appliedAt = "2026-11-21 11:20"
        ),
        TenderApplication(
            id = "tapp-302",
            tenderId = "tnd-202",
            applicantName = "Rajesh Sharma Electrical Crew",
            isTeamBid = true,
            proposedRate = 1100,
            proposedWorkersCount = 8,
            coverNote = "All 8 members hold ITI Wireman permits and carry Fluke multimeters & hydraulic crimpers.",
            status = TenderApplicationStatus.SHORTLISTED,
            appliedAt = "2026-11-21 15:05"
        )
    )

    val defaultWallet = WorkerWallet(
        availableBalance = 4850,
        reservedBalance = 1200,
        todayEarnings = 900,
        weekEarnings = 5400,
        monthEarnings = 22800,
        lifetimeEarnings = 148500,
        totalWithdrawn = 142450,
        commissionDeductions = 16500,
        commissionPayable = 150,
        totalCompletedJobs = 165
    )

    val defaultLedger = listOf(
        WalletLedgerEntry(
            id = "tx-901",
            transactionType = "JOB_EARNING",
            description = "Split AC / Electrical Diagnostics #bk-1003",
            grossAmount = 1000,
            commissionAmount = 100,
            netAmount = 900,
            status = "COMPLETED",
            createdAt = "2026-11-22 10:05"
        ),
        WalletLedgerEntry(
            id = "tx-902",
            transactionType = "WITHDRAWAL_REQUEST",
            description = "Locked for IMPS payout to HDFC •••• 7890",
            grossAmount = 1200,
            commissionAmount = 0,
            netAmount = -1200,
            status = "PENDING",
            createdAt = "2026-11-21 18:30"
        ),
        WalletLedgerEntry(
            id = "tx-903",
            transactionType = "WITHDRAWAL_SUCCESS",
            description = "Settled to rajesh.work@okicici via UPI",
            grossAmount = 2500,
            commissionAmount = 0,
            netAmount = -2500,
            status = "COMPLETED",
            createdAt = "2026-11-19 14:15"
        )
    )

    val defaultPayoutAccounts = listOf(
        PayoutAccount(
            id = "pa-1",
            accountType = "BANK_ACCOUNT",
            accountHolderName = "Rajesh Sharma",
            bankName = "HDFC Bank",
            maskedTarget = "•••• •••• 7890",
            ifscCode = "HDFC0001234",
            isPrimary = true
        ),
        PayoutAccount(
            id = "pa-2",
            accountType = "UPI",
            accountHolderName = "Rajesh Sharma",
            bankName = null,
            maskedTarget = "rajesh.work@okicici",
            ifscCode = null,
            isPrimary = false
        )
    )

    val defaultWithdrawals = listOf(
        WithdrawalRequest(
            id = "wdr-501",
            workerName = "Rajesh Sharma",
            workerPhone = "9876543210",
            payoutTargetMasked = "HDFC Bank (•••• 7890)",
            payoutMethod = "BANK_ACCOUNT",
            amount = 1200,
            fee = 0,
            netPayout = 1200,
            status = WithdrawalStatus.REQUESTED,
            requestedAt = "2026-11-21 18:30"
        ),
        WithdrawalRequest(
            id = "wdr-502",
            workerName = "Rajesh Sharma",
            workerPhone = "9876543210",
            payoutTargetMasked = "rajesh.work@okicici",
            payoutMethod = "UPI",
            amount = 2500,
            fee = 0,
            netPayout = 2500,
            status = WithdrawalStatus.COMPLETED,
            bankTransferReference = "UTR4321987654",
            requestedAt = "2026-11-19 14:15"
        )
    )

    val defaultPlatformFees = listOf(
        PlatformFeeEntry(
            id = "pf-701",
            bookingId = "bk-1003",
            serviceCategory = "AC & Appliance Tech",
            customerName = "Ramesh Kumar",
            workerName = "Mahesh Verma",
            baseWorkerCharge = 450,
            platformFee = 99,
            totalCustomerPayment = 549,
            settlementStatus = "SETTLED",
            createdAt = "2026-11-21 16:35"
        ),
        PlatformFeeEntry(
            id = "pf-702",
            bookingId = "bk-1001",
            serviceCategory = "Electricians",
            customerName = "Ramesh Kumar",
            workerName = "Rajesh Sharma",
            baseWorkerCharge = 700,
            platformFee = 99,
            totalCustomerPayment = 948,
            settlementStatus = "PENDING",
            createdAt = "2026-11-22 09:30"
        )
    )

    val defaultDisputes = listOf(
        JobDispute(
            id = "dsp-401",
            bookingId = "bk-1003",
            customerName = "Ankit Mehra",
            reason = "OVERCHARGING",
            description = "Customer requested breakdown check for extra copper pipe fitting charge beyond standard service.",
            status = DisputeStatus.OPEN,
            createdAt = "2026-11-21 18:10"
        )
    )
}
