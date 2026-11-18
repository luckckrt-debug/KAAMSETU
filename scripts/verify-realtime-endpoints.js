const assert = require('assert');

async function testLiveEndpoints() {
  console.log('Testing live server endpoints on http://localhost:3000...');

  // 1. Admin Operations Endpoint
  const opsRes = await fetch('http://localhost:3000/api/admin/operations');
  assert.strictEqual(opsRes.status, 200);
  const opsData = await opsRes.json();
  console.log('[OK] Admin Operations API:', {
    success: opsData.success,
    onlineWorkers: opsData.totalWorkersOnline,
    activeDispatches: opsData.totalActiveDispatches,
    workersPlotted: opsData.workers?.length,
  });
  assert.strictEqual(opsData.success, true);
  assert.ok(Array.isArray(opsData.workers));

  // 2. Geospatial Worker Discovery Endpoint with Expanding Radius
  const discRes = await fetch('http://localhost:3000/api/workers/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: 28.5355,
      longitude: 77.3910,
      initialRadiusKm: 3,
      maxRadiusKm: 25,
    }),
  });
  assert.strictEqual(discRes.status, 200);
  const discData = await discRes.json();
  console.log('[OK] Worker Discovery API:', {
    success: discData.success,
    searchRadiusKm: discData.searchRadiusKm,
    expanded: discData.expanded,
    workersFound: discData.count,
  });
  assert.strictEqual(discData.success, true);
  assert.ok(discData.searchRadiusKm >= 3);

  // 3. Real Road Routing Endpoint
  const targetBookingId = opsData.activeBookings?.[0]?.id;
  console.log('Testing road routing for booking:', targetBookingId);
  const routeRes = await fetch(`http://localhost:3000/api/bookings/${targetBookingId}/route`);
  assert.strictEqual(routeRes.status, 200);
  const routeData = await routeRes.json();
  console.log('[OK] Road Routing API:', {
    success: routeData.success,
    provider: routeData.route.provider,
    distance: routeData.route.formattedDistance,
    eta: routeData.route.formattedEta,
    waypoints: routeData.route.polyline.length,
    stepsCount: routeData.route.steps.length,
  });
  assert.strictEqual(routeData.success, true);
  assert.ok(routeData.route.polyline.length > 2);
  assert.ok(routeData.route.distanceKm > 0);

  // 4. Booking Dispatch Endpoint
  const dispatchRes = await fetch('http://localhost:3000/api/bookings/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceCategory: 'Electrician',
      serviceDescription: 'Urgent MCB sparking repair in kitchen',
      addressLine: 'Tower 4, Sector 78, Noida',
      customerLatitude: 28.5600,
      customerLongitude: 77.3800,
      estimatedAmount: 450,
      isUrgent: true,
    }),
  });
  assert.strictEqual(dispatchRes.status, 200);
  const dispatchData = await dispatchRes.json();
  console.log('[OK] Booking Dispatch API:', {
    success: dispatchData.success,
    bookingId: dispatchData.booking.id,
    bookingStatus: dispatchData.booking.status,
    candidateWorkersNotified: dispatchData.discovery.workers.length,
  });
  assert.strictEqual(dispatchData.success, true);
  assert.ok(dispatchData.booking.id);

  console.log('\n>>> ALL LIVE HTTP & DISPATCH ENDPOINTS VERIFIED SUCCESSFULLY! <<<');
}

testLiveEndpoints().catch((e) => {
  console.error('Endpoint verification error:', e);
  process.exit(1);
});
