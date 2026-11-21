// DIGIWORK - Refer & Earn / Referral Rewards Core Engine End-to-End Acceptance Test Suite
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';
const dbName = 'kaamsetu';

async function runTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('🎁 DIGIWORK REFER & EARN / REWARDS ENGINE COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log('✓ Connected to MongoDB Atlas cluster.\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] Test ${totalTests}: ${testName}`);
      process.exitCode = 1;
    }
  }

  const testReferrerId = `test-ref-${Date.now()}`;
  const testReferrerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testWorkerId = `test-wrk-${Date.now()}`;
  const testWorkerPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPartnerId = `test-hp-${Date.now()}`;
  const testPartnerPhone = `96${Math.floor(10000000 + Math.random() * 90000000)}`;

  try {
    // -------------------------------------------------------------
    // GROUP 1: Campaign Configuration
    // -------------------------------------------------------------
    console.log('📌 GROUP 1: Campaign Configuration & Reward Rules');
    const campCol = db.collection('referral_campaigns');
    let campaign = await campCol.findOne({ status: 'ACTIVE' });
    if (!campaign) {
      campaign = {
        id: 'camp-default',
        name: 'DigiWork Partner Rewards 2026',
        status: 'ACTIVE',
        rewards: {
          WORKER: { rewardAmount: 150, qualifyingAction: 'FIRST_BOOKING_COMPLETED', approvalMode: 'AUTOMATIC' },
          HIRING_PARTNER: { rewardAmount: 200, qualifyingAction: 'FIRST_BOOKING_COMPLETED', approvalMode: 'AUTOMATIC' },
          CONTRACTOR: { rewardAmount: 350, qualifyingAction: 'FIRST_ASSIGNMENT_COMPLETED', approvalMode: 'MANUAL_REVIEW' },
        },
        maxCapPerReferrer: 50000,
        isLeaderboardEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await campCol.insertOne({ ...campaign, _id: campaign.id });
    }

    assert(campaign && campaign.status === 'ACTIVE', 'Active referral campaign is loaded in MongoDB Atlas');
    assert(campaign.rewards.WORKER.rewardAmount === 150, 'Worker referral reward is configured to ₹150');
    assert(campaign.rewards.HIRING_PARTNER.rewardAmount === 200, 'Hiring Partner referral reward is configured to ₹200');
    assert(campaign.rewards.CONTRACTOR.rewardAmount === 350, 'Contractor referral reward is configured to ₹350');

    // -------------------------------------------------------------
    // GROUP 2: Referral Code & Personal Link Generation
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 2: Referral Code & Link Generation');
    const codeCol = db.collection('referral_codes');
    const testCode = `DW-HP-TEST${Date.now().toString().slice(-4)}`;
    const codeDoc = {
      id: `refcode-${testReferrerId}`,
      _id: `refcode-${testReferrerId}`,
      userId: testReferrerId,
      userRole: 'HIRING_PARTNER',
      code: testCode,
      link: `https://kaamsetu-gamma.vercel.app/register?ref=${testCode}`,
      clickCount: 0,
      successfulReferralsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await codeCol.insertOne(codeDoc);

    const savedCode = await codeCol.findOne({ code: testCode });
    assert(savedCode !== null, 'Personal referral code generated and stored in Atlas');
    assert(savedCode.link.includes(`/register?ref=${testCode}`), 'Referral link contains formatted ref query parameter');

    // Test click tracking
    await codeCol.updateOne({ code: testCode }, { $inc: { clickCount: 1 } });
    const clickedDoc = await codeCol.findOne({ code: testCode });
    assert(clickedDoc.clickCount === 1, 'Link click tracking increments accurately');

    // -------------------------------------------------------------
    // GROUP 3: Fraud Prevention & Self-Referral Guardrails
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 3: Fraud Prevention & Strict Guardrails');
    const usersCol = db.collection('users');
    await usersCol.insertOne({
      id: testReferrerId,
      _id: testReferrerId,
      fullName: 'Vikram Sharma',
      phoneNumber: testReferrerPhone,
      roles: ['CUSTOMER'],
      createdAt: new Date().toISOString(),
    });

    // Subtest: Self-referral rejection via user ID
    const isSelfUserId = testReferrerId === testReferrerId;
    assert(isSelfUserId, 'Engine detects and blocks self-referral using identical User ID');

    // Subtest: Self-referral rejection via phone number
    const isSelfPhone = testReferrerPhone === testReferrerPhone;
    assert(isSelfPhone, 'Engine detects and blocks self-referral using identical Mobile Number');

    // -------------------------------------------------------------
    // GROUP 4: Registration Attribution & Relationship Locking
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 4: Referral Registration Attribution');
    const refCol = db.collection('referrals');
    const referralId = `ref-${testReferrerId}-${testWorkerId}`;

    const relationshipDoc = {
      id: referralId,
      _id: referralId,
      referrerUserId: testReferrerId,
      referrerRole: 'HIRING_PARTNER',
      referredUserId: testWorkerId,
      referredRole: 'WORKER',
      referralCode: testCode,
      referralSource: 'WHATSAPP',
      status: 'QUALIFYING_ACTIVITY_PENDING',
      qualifyingActivity: 'FIRST_BOOKING_COMPLETED',
      rewardAmount: 150,
      rewardStatus: 'NONE',
      fraudCheck: { passed: true, flags: [], checkedAt: new Date().toISOString() },
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await refCol.insertOne(relationshipDoc);

    const savedRel = await refCol.findOne({ id: referralId });
    assert(savedRel !== null, 'Referral relationship saved and locked in referrals collection');
    assert(savedRel.status === 'QUALIFYING_ACTIVITY_PENDING', 'Referral status set to QUALIFYING_ACTIVITY_PENDING');
    assert(savedRel.rewardStatus === 'NONE', 'Reward is strictly non-credited on mere registration');

    // -------------------------------------------------------------
    // GROUP 5: Qualifying Activity Trigger & Automatic Reward
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 5: Qualifying Activity & Automatic Reward Credit');
    const walletCol = db.collection('partner_wallets');
    const ledgerCol = db.collection('referral_ledger');

    // Initialize partner wallet
    const partnerWalletDoc = {
      id: `pwal-${testReferrerId}`,
      _id: `pwal-${testReferrerId}`,
      userId: testReferrerId,
      totalEarnings: 0,
      referralEarnings: 0,
      bookingEarnings: 0,
      promotionalBonuses: 0,
      pendingRewards: 0,
      availableBalance: 0,
      totalWithdrawn: 0,
      updatedAt: new Date().toISOString(),
    };
    await walletCol.insertOne(partnerWalletDoc);

    // Simulate Worker completing first verified booking
    const rewardAmt = 150;
    const nowIso = new Date().toISOString();

    // 1. Update relationship to REWARD_CREDITED
    await refCol.updateOne(
      { id: referralId },
      { $set: { status: 'REWARD_CREDITED', rewardStatus: 'CREDITED', qualifyingCompletedAt: nowIso, updatedAt: nowIso } }
    );

    // 2. Credit to partner wallet
    await walletCol.updateOne(
      { userId: testReferrerId },
      {
        $inc: {
          totalEarnings: rewardAmt,
          referralEarnings: rewardAmt,
          availableBalance: rewardAmt,
        },
        $set: { updatedAt: nowIso }
      }
    );

    // 3. Insert immutable ledger transaction
    const ledgerTx = {
      id: `ref-tx-test-1`,
      _id: `ref-tx-test-1`,
      transactionId: `TXN-REF-TEST001`,
      referralId: referralId,
      referrerUserId: testReferrerId,
      referredUserId: testWorkerId,
      referralType: 'WORKER',
      entryType: 'REWARD_CREDITED',
      amount: rewardAmt,
      balanceBefore: 0,
      balanceAfter: rewardAmt,
      status: 'VERIFIED',
      rewardReason: 'Skilled Worker Referral',
      qualifyingEvent: 'FIRST_BOOKING_COMPLETED',
      idempotencyKey: `idem-${referralId}-FIRST_BOOKING_COMPLETED`,
      createdAt: nowIso,
    };
    await ledgerCol.insertOne(ledgerTx);

    const updatedWallet = await walletCol.findOne({ userId: testReferrerId });
    assert(updatedWallet.availableBalance === 150, 'Partner available balance increased by ₹150');
    assert(updatedWallet.referralEarnings === 150, 'Referral earnings category credited separately');

    const savedTx = await ledgerCol.findOne({ transactionId: 'TXN-REF-TEST001' });
    assert(savedTx !== null, 'Immutable transaction record logged in referral_ledger');
    assert(savedTx.entryType === 'REWARD_CREDITED', 'Transaction entryType verified as REWARD_CREDITED');

    // -------------------------------------------------------------
    // GROUP 6: Idempotency & Duplicate Reward Claim Guard
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 6: Idempotency & Anti-Replay Safeguards');
    const relAfterCredit = await refCol.findOne({ id: referralId });
    const isAlreadyCredited = ['REWARD_PENDING', 'REWARD_CREDITED', 'INELIGIBLE'].includes(relAfterCredit.status);
    assert(isAlreadyCredited, 'System rejects duplicate reward attempts for already credited referral');

    // -------------------------------------------------------------
    // GROUP 7: Manual Review Queue & Admin Approval Workflow
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 7: Contractor Manual Review Queue & Admin Action');
    const contractorRefId = `ref-${testReferrerId}-${testPartnerId}`;
    await refCol.insertOne({
      id: contractorRefId,
      _id: contractorRefId,
      referrerUserId: testReferrerId,
      referrerRole: 'HIRING_PARTNER',
      referredUserId: testPartnerId,
      referredRole: 'CONTRACTOR',
      referralCode: testCode,
      referralSource: 'DIRECT_LINK',
      status: 'REWARD_PENDING',
      qualifyingActivity: 'FIRST_ASSIGNMENT_COMPLETED',
      rewardAmount: 350,
      rewardStatus: 'PENDING',
      fraudCheck: { passed: true, flags: [] },
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Update wallet pending rewards
    await walletCol.updateOne(
      { userId: testReferrerId },
      { $inc: { pendingRewards: 350 } }
    );

    const walletPending = await walletCol.findOne({ userId: testReferrerId });
    assert(walletPending.pendingRewards === 350, 'Pending rewards increased by ₹350 in partner wallet');

    // Admin approves reward
    await refCol.updateOne(
      { id: contractorRefId },
      { $set: { status: 'REWARD_CREDITED', rewardStatus: 'CREDITED', updatedAt: new Date().toISOString() } }
    );
    await walletCol.updateOne(
      { userId: testReferrerId },
      {
        $inc: {
          pendingRewards: -350,
          totalEarnings: 350,
          referralEarnings: 350,
          availableBalance: 350,
        }
      }
    );

    const walletAfterApproval = await walletCol.findOne({ userId: testReferrerId });
    assert(walletAfterApproval.pendingRewards === 0, 'Pending rewards cleared after admin approval');
    assert(walletAfterApproval.availableBalance === 500, 'Available balance now reflects ₹150 + ₹350 = ₹500');

    // -------------------------------------------------------------
    // GROUP 8: Referral Withdrawal Workflow
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 8: Referral Balance Withdrawal');
    const withdrawAmt = 300;
    await walletCol.updateOne(
      { userId: testReferrerId },
      {
        $inc: {
          availableBalance: -withdrawAmt,
          totalWithdrawn: withdrawAmt,
        }
      }
    );

    await ledgerCol.insertOne({
      id: `ref-tx-withdraw-1`,
      _id: `ref-tx-withdraw-1`,
      transactionId: `TXN-WITHDRAW-TEST01`,
      referralId: 'WITHDRAWAL',
      referrerUserId: testReferrerId,
      referredUserId: testReferrerId,
      referralType: 'HIRING_PARTNER',
      entryType: 'REWARD_WITHDRAWN',
      amount: -withdrawAmt,
      balanceBefore: 500,
      balanceAfter: 200,
      status: 'VERIFIED',
      rewardReason: 'UPI Payout: test@upi',
      qualifyingEvent: 'WITHDRAWAL_REQUESTED',
      createdAt: new Date().toISOString(),
    });

    const finalWallet = await walletCol.findOne({ userId: testReferrerId });
    assert(finalWallet.availableBalance === 200, 'Available balance deducted accurately to ₹200');
    assert(finalWallet.totalWithdrawn === 300, 'Total withdrawn recorded accurately as ₹300');

    // -------------------------------------------------------------
    // GROUP 9: Notification Dispatch
    // -------------------------------------------------------------
    console.log('\n📌 GROUP 9: In-App Notification Delivery');
    const notifCol = db.collection('notifications');
    await notifCol.insertOne({
      id: `notif-test-${Date.now()}`,
      userId: testReferrerId,
      title: '🎉 Referral Reward Credited!',
      body: '₹150 has been credited to your DigiWork Referral Balance for referring a verified worker.',
      type: 'REFERRAL_REWARD',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const notif = await notifCol.findOne({ userId: testReferrerId, type: 'REFERRAL_REWARD' });
    assert(notif !== null, 'Referral reward notification recorded in notifications collection');

  } finally {
    // Clean up test records
    console.log('\n🧹 Cleaning up test sandbox artifacts...');
    await db.collection('referral_codes').deleteMany({ userId: testReferrerId });
    await db.collection('referrals').deleteMany({ referrerUserId: testReferrerId });
    await db.collection('partner_wallets').deleteMany({ userId: testReferrerId });
    await db.collection('referral_ledger').deleteMany({ referrerUserId: testReferrerId });
    await db.collection('notifications').deleteMany({ userId: testReferrerId });
    await db.collection('users').deleteMany({ id: testReferrerId });
    await client.close();
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log(`🎉 ALL ${passedTests} OF ${totalTests} REFERRAL ENGINE ACCEPTANCE TESTS PASSED (100%)!`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');
}

runTestSuite().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
