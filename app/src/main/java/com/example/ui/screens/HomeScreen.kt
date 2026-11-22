package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.outlined.Engineering
import androidx.compose.material.icons.outlined.HomeRepairService
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.GeoUtils
import com.example.data.Profession
import com.example.data.ProfessionCatalog
import com.example.data.VerificationStatus
import com.example.data.WorkerProfile
import com.example.ui.components.EmptyStateCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatusBadge
import com.example.ui.components.VerificationBadge
import com.example.ui.theme.AmberDark
import com.example.ui.theme.AmberSoft
import com.example.ui.theme.AmberWarning
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldSoft
import com.example.ui.theme.InkNavy
import com.example.ui.theme.NavyDark
import com.example.ui.theme.SkyPulse

@Composable
fun HomeScreen(
    workers: List<WorkerProfile>,
    searchQuery: String,
    selectedCity: String,
    selectedCategorySlug: String?,
    onSearchQueryChange: (String) -> Unit,
    onCityChange: (String) -> Unit,
    onCategoryFilterClick: (String?) -> Unit,
    onOpenProfession: (Profession) -> Unit,
    onOpenWorker: (WorkerProfile) -> Unit,
    onUrgentDispatchClick: () -> Unit,
    onBookWorkerClick: (WorkerProfile) -> Unit,
    modifier: Modifier = Modifier
) {
    val cities = remember { listOf("All Cities", "Noida", "Gurugram", "Delhi", "Lucknow") }
    var cityDropdownExpanded by remember { mutableStateOf(false) }

    val filteredProfessions = remember(searchQuery) {
        if (searchQuery.isBlank()) ProfessionCatalog.professions
        else ProfessionCatalog.professions.filter { p ->
            p.name.contains(searchQuery, ignoreCase = true) ||
                p.nameHi.contains(searchQuery, ignoreCase = true) ||
                p.popularSkills.any { it.contains(searchQuery, ignoreCase = true) }
        }
    }

    val filteredWorkers = remember(workers, searchQuery, selectedCity, selectedCategorySlug) {
        workers.filter { w ->
            val matchesCity = selectedCity == "All Cities" ||
                w.city.contains(selectedCity, ignoreCase = true) ||
                w.state.contains(selectedCity, ignoreCase = true)
            val matchesSlug = selectedCategorySlug == null ||
                ProfessionCatalog.findByIdOrSlug(w.primaryCategoryId)?.slug == selectedCategorySlug
            val matchesQuery = searchQuery.isBlank() ||
                w.fullName.contains(searchQuery, ignoreCase = true) ||
                w.primaryCategoryName.contains(searchQuery, ignoreCase = true) ||
                w.headline.contains(searchQuery, ignoreCase = true) ||
                w.city.contains(searchQuery, ignoreCase = true) ||
                w.skills.any { it.contains(searchQuery, ignoreCase = true) }
            matchesCity && matchesSlug && matchesQuery
        }.sortedByDescending { it.isOnline }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .widthIn(max = 680.dp),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            HeroBannerCard(
                searchQuery = searchQuery,
                selectedCity = selectedCity,
                cities = cities,
                cityDropdownExpanded = cityDropdownExpanded,
                onCityDropdownToggle = { cityDropdownExpanded = it },
                onSearchQueryChange = onSearchQueryChange,
                onCitySelected = {
                    onCityChange(it)
                    cityDropdownExpanded = false
                }
            )
        }

        item {
            SectionHeader(
                title = "Explore Skilled Trades",
                subtitle = "12 verified categories with transparent rate cards"
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedCategorySlug == null,
                    onClick = { onCategoryFilterClick(null) },
                    label = { Text("All Trades") },
                    modifier = Modifier
                        .heightIn(min = 48.dp)
                        .testTag("filter_trade_all"),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.secondary,
                        selectedLabelColor = Color.White
                    )
                )
                ProfessionCatalog.professions.take(7).forEach { prof ->
                    val isSelected = selectedCategorySlug == prof.slug
                    FilterChip(
                        selected = isSelected,
                        onClick = { onCategoryFilterClick(prof.slug) },
                        label = { Text(prof.name) },
                        modifier = Modifier
                            .heightIn(min = 48.dp)
                            .testTag("filter_trade_${prof.slug}"),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredProfessions, key = { it.id }) { prof ->
                    ProfessionMiniCard(
                        profession = prof,
                        onClick = { onOpenProfession(prof) }
                    )
                }
            }
        }

        item {
            UrgentDispatchBanner(onUrgentDispatchClick = onUrgentDispatchClick)
        }

        item {
            SectionHeader(
                title = "Nearby Verified Specialists",
                subtitle = "${filteredWorkers.size} pros ready across ${selectedCity}",
                actionLabel = if (selectedCategorySlug != null || searchQuery.isNotBlank()) "Reset" else null,
                onActionClick = {
                    onCategoryFilterClick(null)
                    onSearchQueryChange("")
                    onCityChange("All Cities")
                }
            )
        }

        if (filteredWorkers.isEmpty()) {
            item {
                EmptyStateCard(
                    icon = Icons.Outlined.Engineering,
                    title = "No specialists match your filter",
                    description = "Try switching city to All Cities or clearing your search keywords."
                )
            }
        } else {
            items(filteredWorkers, key = { it.id }) { worker ->
                WorkerDiscoveryCard(
                    worker = worker,
                    onViewProfile = { onOpenWorker(worker) },
                    onBookWorker = { onBookWorkerClick(worker) }
                )
            }
        }
    }
}

@Composable
private fun HeroBannerCard(
    searchQuery: String,
    selectedCity: String,
    cities: List<String>,
    cityDropdownExpanded: Boolean,
    onCityDropdownToggle: (Boolean) -> Unit,
    onSearchQueryChange: (String) -> Unit,
    onCitySelected: (String) -> Unit
) {
    Card(
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = DeepNavy),
        border = BorderStroke(1.dp, ElectricBlue.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(175.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.img_hero_workforce),
                    contentDescription = "DigiWork verified Indian tradespeople",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    NavyDark.copy(alpha = 0.25f),
                                    DeepNavy.copy(alpha = 0.92f)
                                )
                            )
                        )
                )
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    StatusBadge(
                        text = stringResource(R.string.tagline_bilingual),
                        containerColor = Color.White.copy(alpha = 0.16f),
                        contentColor = SkyPulse
                    )
                    Column {
                        Text(
                            text = stringResource(R.string.tagline),
                            style = MaterialTheme.typography.headlineMedium,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Book Aadhaar-verified electricians, plumbers, masons & site engineers in minutes.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.85f),
                            maxLines = 2
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DeepNavy)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    placeholder = { Text("Search Electrician, Plumber, Wiring, Noida...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onSearchQueryChange("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear search")
                            }
                        }
                    },
                    singleLine = true,
                    shape = MaterialTheme.shapes.small,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedTextColor = InkNavy,
                        unfocusedTextColor = InkNavy
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("home_search_input")
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box {
                        Surface(
                            onClick = { onCityDropdownToggle(true) },
                            color = Color.White.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, SkyPulse.copy(alpha = 0.4f)),
                            modifier = Modifier
                                .heightIn(min = 48.dp)
                                .testTag("home_city_selector")
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = "Selected city",
                                    tint = SkyPulse,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = selectedCity,
                                    style = MaterialTheme.typography.labelLarge,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.KeyboardArrowDown,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        DropdownMenu(
                            expanded = cityDropdownExpanded,
                            onDismissRequest = { onCityDropdownToggle(false) }
                        ) {
                            cities.forEach { city ->
                                DropdownMenuItem(
                                    text = { Text(city) },
                                    onClick = { onCitySelected(city) }
                                )
                            }
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = SkyPulse,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "₹99 Transparent Fee",
                            style = MaterialTheme.typography.labelLarge,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfessionMiniCard(
    profession: Profession,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(190.dp)
            .clickable(onClick = onClick)
            .testTag("profession_card_${profession.slug}"),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.HomeRepairService,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Text(
                    text = "₹${profession.baseHourlyRate}/hr",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = profession.name,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = profession.nameHi,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = profession.workerCountEstimate,
                style = MaterialTheme.typography.labelSmall,
                color = EmeraldDark
            )
        }
    }
}

@Composable
private fun UrgentDispatchBanner(onUrgentDispatchClick: () -> Unit) {
    Card(
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = AmberSoft),
        border = BorderStroke(1.dp, AmberWarning)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(AmberWarning),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = "Urgent 25-minute dispatch",
                        tint = Color.White
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Urgent 25-Min Emergency Dispatch",
                        style = MaterialTheme.typography.titleMedium,
                        color = AmberDark
                    )
                    Text(
                        text = "Short circuit or burst pipe? Priority GPS match (+₹149).",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkNavy
                    )
                }
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onUrgentDispatchClick,
                colors = ButtonDefaults.buttonColors(containerColor = DeepNavy),
                modifier = Modifier
                    .heightIn(min = 48.dp)
                    .testTag("urgent_dispatch_button"),
                contentPadding = PaddingValues(horizontal = 14.dp)
            ) {
                Text("Dispatch")
            }
        }
    }
}

@Composable
private fun WorkerDiscoveryCard(
    worker: WorkerProfile,
    onViewProfile: () -> Unit,
    onBookWorker: () -> Unit
) {
    val distanceKm = remember(worker) {
        GeoUtils.calculateDistanceKm(28.5355, 77.3910, worker.latitude, worker.longitude)
    }
    val etaMins = remember(distanceKm) {
        GeoUtils.calculateEstimatedEtaMinutes(distanceKm, isUrgent = false)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onViewProfile)
            .testTag("worker_card_${worker.id}"),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = worker.fullName,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (worker.verificationStatus == VerificationStatus.VERIFIED) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = "Verified specialist",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(17.dp)
                            )
                        }
                    }
                    Text(
                        text = worker.headline,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "₹${worker.hourlyRate}/hr",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "₹${worker.dailyRate}/day",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                VerificationBadge(worker.verificationStatus)
                StatusBadge(
                    text = if (worker.isOnline) "Online • ${etaMins}m ETA" else "Offline",
                    containerColor = if (worker.isOnline) EmeraldSoft else MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = if (worker.isOnline) EmeraldDark else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "${worker.ratingAvg} (${worker.ratingCount})",
                        style = MaterialTheme.typography.labelLarge
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(
                        text = "${worker.locality}, ${worker.city} • ${distanceKm} km",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onViewProfile,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 48.dp)
                        .testTag("worker_details_btn_${worker.id}")
                ) {
                    Text("Profile & KYC")
                }
                Button(
                    onClick = onBookWorker,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 48.dp)
                        .testTag("worker_book_btn_${worker.id}")
                ) {
                    Text(stringResource(R.string.action_book_now))
                }
            }
        }
    }
}
