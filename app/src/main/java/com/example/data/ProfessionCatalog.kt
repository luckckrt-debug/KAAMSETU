package com.example.data

object ProfessionCatalog {
    val popularLocations = listOf(
        "Delhi NCR",
        "Noida, UP",
        "Gurugram, Haryana",
        "Lucknow, UP",
        "Patna, Bihar",
        "Mumbai, Maharashtra",
        "Bengaluru, Karnataka",
        "Jaipur, Rajasthan"
    )

    val professions: List<Profession> = listOf(
        Profession(
            id = "cat-electrician",
            slug = "electrician",
            name = "Electricians",
            nameHi = "बिजली मिस्त्री",
            sector = "Home & Domestic",
            intro = "Certified electricians for concealed residential wiring, MCB tripping repair, inverter-battery setup, switchboards, and emergency short circuits.",
            baseHourlyRate = 350,
            baseDailyRate = 1100,
            workerCountEstimate = "1,420+ Available",
            popularSkills = listOf("House Wiring", "MCB Box Repair", "Inverter Battery", "Ceiling Fan", "Short Circuit"),
            subcategories = listOf(
                ProfessionSubcategory("sub-elec-1", "House Wiring & Conduit", "वायरिंग व पाइपिंग", "Complete 1BHK/2BHK/3BHK concealed wiring and cable pulling.", "₹15–22 / ft"),
                ProfessionSubcategory("sub-elec-2", "MCB & Short Circuit Repair", "शॉर्ट सर्किट और एमसीबी", "Tripping MCB diagnosis, load balancing, burnt neutral repair.", "₹350 / callout"),
                ProfessionSubcategory("sub-elec-3", "Inverter & Battery Wiring", "इन्वर्टर और बैटरी", "Dual battery & solar hybrid inverter setup with bypass switch.", "₹450 / setup")
            ),
            pricingGuide = listOf(
                PricingItem("Switchboard Inspection & Repair", "₹199", "30 mins", "Fault diagnosis, loose contact tightening, socket replacement."),
                PricingItem("Ceiling Fan Installation", "₹199", "45 mins", "Hook balancing, rod assembly, regulator connection."),
                PricingItem("MCB Distribution Board Change", "₹499", "1.5 hrs", "Isolator and circuit breaker replacement with load check.")
            ),
            requiredTools = listOf("Digital Multimeter", "1000V Insulated Pliers", "Rotary Hammer Drill", "Phase Tester"),
            certifications = listOf("ITI Electrical Trade (NCVT)", "State Wireman Licence", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-plumber",
            slug = "plumber",
            name = "Plumbers",
            nameHi = "नल मिस्त्री",
            sector = "Home & Domestic",
            intro = "Sanitary plumbers for CPVC/UPVC concealed pipe fittings, tap leaks, diverters, water pump motors, and overhead tank cleaning.",
            baseHourlyRate = 300,
            baseDailyRate = 950,
            workerCountEstimate = "980+ Available",
            popularSkills = listOf("Pipe Leakage", "Diverter Repair", "Water Motor Pump", "Tank Cleaning", "Drain Unclogging"),
            subcategories = listOf(
                ProfessionSubcategory("sub-plumb-1", "Pipe Leakage & Tap Repair", "पाइप लीकेज व नल रिपेयर", "Wall dampness detection, thread sealant, cartridge change.", "₹199 / fixture"),
                ProfessionSubcategory("sub-plumb-2", "Water Motor & Pump Service", "मोटर पंप फिटिंग", "1HP monobloc & submersible pump installation and priming.", "₹350 / pump"),
                ProfessionSubcategory("sub-plumb-3", "Overhead Tank Cleaning", "पानी की टंकी सफाई", "500L–2000L pressure jet washing and UV sanitation.", "₹499 / tank")
            ),
            pricingGuide = listOf(
                PricingItem("Tap / Spout Repair", "₹149", "20 mins", "Spindle washer change, thread sealing, leak stoppage."),
                PricingItem("Water Motor Installation", "₹399", "1 hr", "Inlet/outlet union fitting and foot-valve priming."),
                PricingItem("Drain Blockage Removal", "₹349", "45 mins", "Mechanical drain auger clearing and trap cleaning.")
            ),
            requiredTools = listOf("Pipe Wrench (14\" & 18\")", "Pressure Testing Pump", "Drain Auger Cable", "Teflon Sealant"),
            certifications = listOf("Vocational Sanitary Plumbing Certificate", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-mason",
            slug = "mason",
            name = "Masons (Raj Mistri)",
            nameHi = "राज मिस्त्री",
            sector = "Construction & Civil",
            intro = "Experienced raj mistris for brick masonry, cement plastering, lintel casting, boundary walls, foundation footings, and structural repairs.",
            baseHourlyRate = 400,
            baseDailyRate = 1050,
            workerCountEstimate = "2,150+ Available",
            popularSkills = listOf("Brickwork", "Cement Plaster", "Lintel Casting", "Boundary Wall", "Tile Base"),
            subcategories = listOf(
                ProfessionSubcategory("sub-mason-1", "Brickwork & Wall Construction", "ईंट की चिनाई", "4.5-inch and 9-inch brick masonry with plumb-line precision.", "₹12–18 / sq ft"),
                ProfessionSubcategory("sub-mason-2", "Cement Mortar Plastering", "सीमेंट प्लास्टर", "Internal smooth & external waterproof sand plaster.", "₹14–20 / sq ft")
            ),
            pricingGuide = listOf(
                PricingItem("Daily Skilled Mason Wage", "₹1,050", "8 hrs shift", "Full day masonry work adhering to ISI brick standards."),
                PricingItem("Boundary Wall Labour Rate", "₹85", "per running ft", "Foundation trench, PCC, 9-inch brickwork, coping beam.")
            ),
            requiredTools = listOf("Spirit Level", "Plumb Bob (Sahul)", "Brick Trowel (Karni)", "Measuring Tape"),
            certifications = listOf("CSDC Skill Certificate", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-carpenter",
            slug = "carpenter",
            name = "Carpenters",
            nameHi = "बढ़ई (लकड़ी का काम)",
            sector = "Home & Domestic",
            intro = "Master woodworkers for door & window repair, mortise locks, modular kitchen cabinets, wardrobes, and custom furniture.",
            baseHourlyRate = 350,
            baseDailyRate = 1000,
            workerCountEstimate = "840+ Available",
            popularSkills = listOf("Modular Kitchen", "Door Locks", "Wardrobe Making", "Bed Repair", "Wood Polishing"),
            subcategories = listOf(
                ProfessionSubcategory("sub-carp-1", "Door & Mortise Lock Fitting", "दरवाजे व ताला रिपेयर", "Door planing, Godrej mortise locks, hinges, stoppers.", "₹249 / door"),
                ProfessionSubcategory("sub-carp-2", "Modular Kitchen Cabinets", "मॉड्यूलर किचन", "Soft-close tandem boxes, corner carousels, marine ply.", "₹1,200 / sq ft")
            ),
            pricingGuide = listOf(
                PricingItem("Godrej / Yale Lock Installation", "₹299", "45 mins", "Wood chiseling, lock body fitting, deadbolt testing."),
                PricingItem("Full Day Carpenter Wage", "₹1,000", "8 hrs shift", "On-site fabrication, laminate pasting, and alterations.")
            ),
            requiredTools = listOf("Circular Saw", "Power Wood Planer", "Chisel Set", "Cordless Impact Driver"),
            certifications = listOf("FFSC Woodcraft Card", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-painter",
            slug = "painter",
            name = "Painters",
            nameHi = "रंग मिस्त्री",
            sector = "Home & Domestic",
            intro = "Professional interior & exterior painters for wall putty, damp-proofing, exterior weathercoat, luxury textures, and wood polish.",
            baseHourlyRate = 300,
            baseDailyRate = 850,
            workerCountEstimate = "1,120+ Available",
            popularSkills = listOf("Wall Putty", "Damp Proofing", "Luxury Emulsion", "Texture Art", "PU Polish"),
            subcategories = listOf(
                ProfessionSubcategory("sub-paint-1", "Interior Painting & Putty", "अंदरूनी पेंट व पुट्टी", "2 coats white putty, sanding, primer, washable emulsion.", "₹12–18 / sq ft"),
                ProfessionSubcategory("sub-paint-2", "Waterproofing & Damp Repair", "सीलन व वॉटरप्रूफिंग", "Chemical injection & anti-efflorescence coating.", "₹25 / sq ft")
            ),
            pricingGuide = listOf(
                PricingItem("Single Room Repaint (Labour)", "₹2,499", "1.5 days", "Wall prep, minor crack putty, 2 coats emulsion."),
                PricingItem("Daily Painter Wage", "₹850", "8 hrs shift", "Scraping, masking, priming, and painting.")
            ),
            requiredTools = listOf("Airless Paint Sprayer", "Putty Knives", "Orbital Sander", "Masking Film"),
            certifications = listOf("PCSC Certified Painter", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-ac-tech",
            slug = "ac-technicians",
            name = "AC & Appliance Tech",
            nameHi = "एसी व उपकरण टेक्नीशियन",
            sector = "Home & Domestic",
            intro = "HVAC technicians for split & window AC power foam jet servicing, copper piping, refrigerant gas top-up, and PCB repairs.",
            baseHourlyRate = 450,
            baseDailyRate = 1200,
            workerCountEstimate = "760+ Available",
            popularSkills = listOf("Foam Jet Service", "Gas Refill", "Split AC Install", "Inverter PCB", "Copper Piping"),
            subcategories = listOf(
                ProfessionSubcategory("sub-ac-1", "Power Jet Foam Service", "एसी सर्विस व फोम जेट", "High-pressure jet wash with protective jacket.", "₹449 / unit"),
                ProfessionSubcategory("sub-ac-2", "Gas Refill & Leak Testing", "गैस टॉपअप व लीकेज", "Nitrogen leak test, brazing, R32/R410A full charge.", "₹1,999 / unit")
            ),
            pricingGuide = listOf(
                PricingItem("Split AC Power Jet Foam Service", "₹449", "45 mins", "Indoor cooling coil & outdoor condenser jet wash."),
                PricingItem("Split AC Installation", "₹999", "1.5 hrs", "Bracket mounting, core hole, vacuum evacuation.")
            ),
            requiredTools = listOf("Foam Jet Washer", "Digital Manifold Gauge", "Rotary Vacuum Pump", "Flaring Kit"),
            certifications = listOf("ITI RAC Certified", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-welder",
            slug = "welders",
            name = "Welders & Fabricators",
            nameHi = "वेल्डर व फेब्रिकेटर",
            sector = "Construction & Civil",
            intro = "Certified welders for iron main gates, balcony grills, tin sheds, staircase railings, and emergency spot repairs.",
            baseHourlyRate = 400,
            baseDailyRate = 1150,
            workerCountEstimate = "630+ Available",
            popularSkills = listOf("ARC Welding", "Main Gates", "Balcony Grills", "Tin Sheds", "Spot Repair"),
            subcategories = listOf(
                ProfessionSubcategory("sub-weld-1", "Gates & Balcony Grills", "गेट व ग्रिल फेब्रिकेशन", "Custom MS safety grills and sliding gates.", "₹110 / kg"),
                ProfessionSubcategory("sub-weld-2", "On-Site Spot Welding", "स्पॉट वेल्डिंग रिपेयर", "Broken gate hinges, railing reattachment, lock lugs.", "₹399 / spot")
            ),
            pricingGuide = listOf(
                PricingItem("Gate Hinge / Latch Welding", "₹399", "45 mins", "Pin welding and anti-rust primer coat."),
                PricingItem("Daily Welder + Machine Wage", "₹1,450", "8 hrs shift", "Includes portable inverter ARC machine & rods.")
            ),
            requiredTools = listOf("Inverter ARC Machine", "Angle Grinder", "Auto-Darkening Helmet"),
            certifications = listOf("ITI Welder (NCVT)", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-labour",
            slug = "construction-workers",
            name = "Construction Labour",
            nameHi = "निर्माण मजदूर (बेलदार)",
            sector = "Construction & Civil",
            intro = "Daily wage building site helpers, material loading/unloading workers, excavation helpers, and concrete mixers.",
            baseHourlyRate = 200,
            baseDailyRate = 650,
            workerCountEstimate = "4,500+ Available",
            popularSkills = listOf("Material Shifting", "Site Helper", "Debris Clearing", "Concrete Mixing"),
            subcategories = listOf(
                ProfessionSubcategory("sub-lab-1", "Daily Site Helper (Beldar)", "दैनिक मजदूर", "Mason assistance, mortar mixing, brick carrying.", "₹650 / day"),
                ProfessionSubcategory("sub-lab-2", "Material Loading & Unloading", "सामान ढुलाई", "Cement bags, steel saria, sand & tile shifting.", "₹700 / day")
            ),
            pricingGuide = listOf(
                PricingItem("Daily Site Helper Shift", "₹650", "8 hrs shift", "08:30 AM to 05:30 PM site helper shift."),
                PricingItem("Debris Clearing Team", "₹1,499", "2 hrs", "Loading construction malba onto tipper trucks.")
            ),
            requiredTools = listOf("Safety Hard Hat", "Safety Vest", "Steel-Toe Boots", "Spade & Pan"),
            certifications = listOf("BOCW / e-Shram Card", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-housekeeping",
            slug = "cleaners",
            name = "Housekeeping & Deep Clean",
            nameHi = "डीप क्लीनिंग व सफाई",
            sector = "Facility & Security",
            intro = "Deep cleaning specialists for homes, sofa & mattress shampooing, kitchen degreasing, and bathroom descaling.",
            baseHourlyRate = 250,
            baseDailyRate = 750,
            workerCountEstimate = "1,650+ Available",
            popularSkills = listOf("Home Deep Clean", "Sofa Shampoo", "Kitchen Degrease", "Bathroom Descaling"),
            subcategories = listOf(
                ProfessionSubcategory("sub-clean-1", "Full Home Deep Clean", "फुल होम डीप क्लीनिंग", "Ceiling to floor intensive cleaning for 1/2/3 BHK.", "₹2,499–4,999"),
                ProfessionSubcategory("sub-clean-2", "Sofa & Mattress Shampoo", "सोफा शैम्पू", "Wet extraction vacuuming for stain & mite removal.", "₹799 / 5-seater")
            ),
            pricingGuide = listOf(
                PricingItem("2 BHK Complete Deep Clean", "₹3,499", "5 hrs", "2 cleaners with floor scrubber and Taski chemicals."),
                PricingItem("5-Seater Sofa Shampoo", "₹799", "1.5 hrs", "Foam wash and wet extraction vacuum.")
            ),
            requiredTools = listOf("Single-Disc Scrubber", "Wet & Dry Vacuum", "Steam Cleaner"),
            certifications = listOf("Hospitality Sanitation Training", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-driver",
            slug = "drivers",
            name = "Drivers & Chauffeurs",
            nameHi = "ड्राइवर व शॉफर",
            sector = "Transport & Logistics",
            intro = "Police-verified commercial chauffeurs, intra-city goods truck pilots, and outstation highway drivers.",
            baseHourlyRate = 250,
            baseDailyRate = 850,
            workerCountEstimate = "1,850+ Available",
            popularSkills = listOf("Personal Chauffeur", "Outstation Driver", "Automatic Cars", "Night Driving"),
            subcategories = listOf(
                ProfessionSubcategory("sub-driv-1", "Daily Personal Chauffeur", "पर्सनल शॉफर", "8 to 12 hour dedicated driver for your car.", "₹850 / day"),
                ProfessionSubcategory("sub-driv-2", "Outstation Highway Driver", "आउटस्टेशन ड्राइवर", "Long-distance hill station & interstate trips.", "₹1,200 / day")
            ),
            pricingGuide = listOf(
                PricingItem("Daily Chauffeur (8 Hours)", "₹850", "8 hrs", "City commute, meetings, and family transit."),
                PricingItem("One-Way Airport / City Trip", "₹399", "2 hrs", "Drive your vehicle safely to airport or venue.")
            ),
            requiredTools = listOf("LMV / HMV Commercial Licence", "GPS Navigation"),
            certifications = listOf("RTO Commercial Badge", "Police Verification", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-civil-engineer",
            slug = "civil-engineers",
            name = "Civil Site Engineers",
            nameHi = "सिविल साइट इंजीनियर",
            sector = "Engineering & IT",
            intro = "Qualified B.Tech/Diploma civil engineers for structural QA/QC, bar bending schedules, and contractor oversight.",
            baseHourlyRate = 600,
            baseDailyRate = 1800,
            workerCountEstimate = "340+ Available",
            popularSkills = listOf("Structural QA/QC", "BBS Schedule", "Site Supervision", "AutoCAD Reading"),
            subcategories = listOf(
                ProfessionSubcategory("sub-civ-1", "Site Quality Supervision", "क्वालिटी चेकिंग", "Concrete cube testing & shuttering alignment audit.", "₹1,800 / day")
            ),
            pricingGuide = listOf(
                PricingItem("Daily Civil Engineer Audit", "₹1,800", "8 hrs shift", "Technical supervision of casting & masonry."),
                PricingItem("Pre-Pour Slab Rebar Inspection", "₹1,199", "2 hrs", "Cover blocks, lap lengths, and conduit check.")
            ),
            requiredTools = listOf("Auto Level", "Schmidt Rebound Hammer", "Vernier Caliper"),
            certifications = listOf("B.Tech / Diploma Civil Engineering", "Aadhaar Verified")
        ),
        Profession(
            id = "cat-security-guard",
            slug = "security-guards",
            name = "Security Guards & Bouncers",
            nameHi = "सुरक्षा गार्ड व बाउंसर",
            sector = "Facility & Security",
            intro = "PSARA-certified uniformed security guards, residential society watchmen, and event safety bouncers.",
            baseHourlyRate = 250,
            baseDailyRate = 850,
            workerCountEstimate = "1,950+ Available",
            popularSkills = listOf("PSARA Certified", "Gate Access Control", "Fire Safety", "Event Bouncer"),
            subcategories = listOf(
                ProfessionSubcategory("sub-sec-1", "Society Security Guard", "सोसायटी सुरक्षा गार्ड", "12-hour shift with digital visitor management.", "₹850 / shift")
            ),
            pricingGuide = listOf(
                PricingItem("Uniformed Guard (12-Hr Shift)", "₹850", "12 hrs", "Visitor screening and perimeter patrol.")
            ),
            requiredTools = listOf("Metal Detector Wand", "Walkie-Talkie", "Security Torch"),
            certifications = listOf("PSARA Training Certificate", "Police Clearance", "Aadhaar Verified")
        )
    )

    fun findByIdOrSlug(idOrSlug: String): Profession? {
        return professions.firstOrNull {
            it.id.equals(idOrSlug, ignoreCase = true) ||
                it.slug.equals(idOrSlug, ignoreCase = true) ||
                it.name.contains(idOrSlug, ignoreCase = true)
        }
    }
}
