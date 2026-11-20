// KAAMSETU — MongoDB Atlas Profession Catalogue Manager & Synchronization Layer
// Dynamically synchronizes 26 Categories (A-Z) and Professions into MongoDB Atlas collections:
// - profession_categories
// - profession_subcategories
// - professions
// - profession_suggestions
// - worker_professions

import { getMongoDb, getMongoCollection, recordAdminAuditLog } from './mongodb';
import { 
  MASTER_CATEGORIES, 
  MASTER_PROFESSIONS, 
  MasterCategory, 
  MasterProfession,
  findProfessionByIdOrSlug
} from './professions-master';

let isInitialized = false;

/**
 * Initializes and seeds MongoDB Atlas with the master catalogue if empty,
 * and ensures essential search indexes exist.
 */
export async function ensureProfessionCatalogueInitialized(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    const db = await getMongoDb();
    if (!db) {
      console.warn('[Profession Catalogue] MongoDB Atlas not available, using in-memory master.');
      return false;
    }

    const catCol = db.collection('profession_categories');
    const profCol = db.collection('professions');
    const subCol = db.collection('profession_subcategories');
    const suggCol = db.collection('profession_suggestions');
    const workerProfCol = db.collection('worker_professions');

    // 1. Create essential indexes
    await catCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await catCol.createIndex({ slug: 1 }).catch(() => {});
    await catCol.createIndex({ code: 1 }).catch(() => {});

    await profCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await profCol.createIndex({ slug: 1 }).catch(() => {});
    await profCol.createIndex({ categoryId: 1 }).catch(() => {});
    await profCol.createIndex({ subcategoryId: 1 }).catch(() => {});
    await profCol.createIndex({ aliases: 1 }).catch(() => {});
    await profCol.createIndex({ name: 'text', nameHi: 'text', aliases: 'text' }).catch(() => {});

    await suggCol.createIndex({ status: 1 }).catch(() => {});
    await workerProfCol.createIndex({ workerProfileId: 1, professionId: 1 }).catch(() => {});

    // 2. Seed categories if empty
    const catCount = await catCol.countDocuments();
    if (catCount === 0) {
      console.log('[Profession Catalogue] Seeding 26 Master Categories into MongoDB Atlas...');
      for (const cat of MASTER_CATEGORIES) {
        await catCol.updateOne(
          { id: cat.id },
          { $set: { ...cat, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );

        for (const sub of cat.subcategories) {
          await subCol.updateOne(
            { id: sub.id },
            { $set: { ...sub, categoryId: cat.id, updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
        }
      }
    }

    // 3. Seed professions if empty
    const profCount = await profCol.countDocuments();
    if (profCount === 0) {
      console.log('[Profession Catalogue] Seeding Master Professions into MongoDB Atlas...');
      for (const prof of MASTER_PROFESSIONS) {
        await profCol.updateOne(
          { id: prof.id },
          { $set: { ...prof, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    }

    isInitialized = true;
    return true;
  } catch (err) {
    console.error('[Profession Catalogue Error]:', err);
    return false;
  }
}

/**
 * Get all active categories with their subcategories
 */
export async function getDynamicCategories(): Promise<MasterCategory[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const col = db.collection('profession_categories');
      const docs = await col.find({}).sort({ code: 1 }).toArray();
      if (docs && docs.length > 0) {
        return docs.map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          nameHi: d.nameHi,
          slug: d.slug,
          iconName: d.iconName,
          description: d.description,
          subcategories: d.subcategories || []
        }));
      }
    }
  } catch (e) {
    console.error('[Get Categories Error]:', e);
  }
  return MASTER_CATEGORIES;
}

/**
 * Get professions with universal query filter (English, Hindi, Aliases, Category)
 */
export async function getDynamicProfessions(filter?: {
  categoryId?: string;
  subcategoryId?: string;
  query?: string;
  includeInactive?: boolean;
}): Promise<MasterProfession[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const col = db.collection('professions');
      const mongoQuery: any = {};

      if (!filter?.includeInactive) {
        mongoQuery.isActive = true;
      }
      if (filter?.categoryId) {
        mongoQuery.categoryId = filter.categoryId;
      }
      if (filter?.subcategoryId) {
        mongoQuery.subcategoryId = filter.subcategoryId;
      }

      if (filter?.query && filter.query.trim()) {
        const q = filter.query.trim();
        const regex = new RegExp(q, 'i');
        mongoQuery.$or = [
          { name: regex },
          { nameHi: regex },
          { singular: regex },
          { aliases: regex },
          { popularSkills: regex }
        ];
      }

      const docs = await col.find(mongoQuery).toArray();
      if (docs && docs.length > 0) {
        return docs.map(d => ({
          id: d.id,
          slug: d.slug,
          categoryId: d.categoryId,
          subcategoryId: d.subcategoryId,
          name: d.name,
          nameHi: d.nameHi,
          singular: d.singular,
          aliases: d.aliases || [],
          description: d.description || '',
          popularSkills: d.popularSkills || [],
          baseHourlyRate: d.baseHourlyRate || 300,
          baseDailyRate: d.baseDailyRate || 900,
          isRegulated: d.isRegulated || false,
          verificationRequirements: d.verificationRequirements || [],
          isActive: d.isActive !== false
        }));
      }
    }
  } catch (e) {
    console.error('[Get Professions Error]:', e);
  }

  // Fallback to in-memory catalogue
  let fallback = MASTER_PROFESSIONS.filter(p => filter?.includeInactive ? true : p.isActive);
  if (filter?.categoryId) fallback = fallback.filter(p => p.categoryId === filter.categoryId);
  if (filter?.subcategoryId) fallback = fallback.filter(p => p.subcategoryId === filter.subcategoryId);
  if (filter?.query) {
    const q = filter.query.toLowerCase().trim();
    fallback = fallback.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.nameHi.includes(q) ||
      p.aliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase())) ||
      p.popularSkills.some(s => s.toLowerCase().includes(q))
    );
  }
  return fallback;
}

/**
 * Submit a custom / missing profession by Worker or Contractor
 */
export async function submitProfessionSuggestion(data: {
  name: string;
  nameHi?: string;
  categorySuggestion?: string;
  skills?: string[];
  description?: string;
  submittedByUserId?: string;
  submittedByRole?: string;
}): Promise<{ success: boolean; suggestionId?: string; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { success: false, error: 'Database connection unavailable' };
    }

    const col = db.collection('profession_suggestions');
    const id = `sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newSuggestion = {
      id,
      name: data.name.trim(),
      nameHi: (data.nameHi || '').trim(),
      categorySuggestion: data.categorySuggestion || 'cat-z-custom-professions',
      skills: data.skills || [],
      description: data.description || '',
      submittedByUserId: data.submittedByUserId || 'anonymous',
      submittedByRole: data.submittedByRole || 'WORKER',
      status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await col.insertOne(newSuggestion);

    return { success: true, suggestionId: id };
  } catch (err: any) {
    console.error('[Submit Suggestion Error]:', err);
    return { success: false, error: err?.message || 'Failed to submit suggestion' };
  }
}

/**
 * Admin: Get all custom profession suggestions
 */
export async function getProfessionSuggestions(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const col = db.collection('profession_suggestions');
    const query = status ? { status } : {};
    return await col.find(query).sort({ createdAt: -1 }).toArray();
  } catch (e) {
    return [];
  }
}

/**
 * Admin: Approve or Reject custom profession suggestion
 */
export async function reviewProfessionSuggestion(
  suggestionId: string, 
  decision: 'APPROVED' | 'REJECTED', 
  reviewData?: {
    approvedCategoryId?: string;
    approvedSubcategoryId?: string;
    standardName?: string;
    standardNameHi?: string;
    adminNotes?: string;
    aliases?: string[];
  },
  adminUser?: { id: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) return { success: false, error: 'DB unavailable' };

    const suggCol = db.collection('profession_suggestions');
    const suggestion = await suggCol.findOne({ id: suggestionId });

    if (!suggestion) {
      return { success: false, error: 'Suggestion not found' };
    }

    if (decision === 'APPROVED') {
      const profCol = db.collection('professions');
      const cleanName = reviewData?.standardName || suggestion.name;
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProfId = `prof-custom-${Date.now()}`;

      const newProfession: MasterProfession = {
        id: newProfId,
        slug,
        categoryId: reviewData?.approvedCategoryId || suggestion.categorySuggestion || 'cat-z-custom-professions',
        subcategoryId: reviewData?.approvedSubcategoryId || 'sub-z1-custom',
        name: cleanName,
        nameHi: reviewData?.standardNameHi || suggestion.nameHi || cleanName,
        singular: cleanName,
        aliases: reviewData?.aliases || [cleanName.toLowerCase(), slug],
        description: suggestion.description || `Custom profession: ${cleanName}`,
        popularSkills: suggestion.skills || [],
        baseHourlyRate: 350,
        baseDailyRate: 1000,
        isActive: true
      };

      await profCol.updateOne({ id: newProfId }, { $set: newProfession }, { upsert: true });

      await suggCol.updateOne(
        { id: suggestionId },
        { 
          $set: { 
            status: 'APPROVED', 
            approvedProfId: newProfId, 
            adminNotes: reviewData?.adminNotes || 'Approved into live catalogue',
            reviewedAt: new Date().toISOString() 
          } 
        }
      );
    } else {
      await suggCol.updateOne(
        { id: suggestionId },
        { 
          $set: { 
            status: 'REJECTED', 
            adminNotes: reviewData?.adminNotes || 'Rejected by administrator',
            reviewedAt: new Date().toISOString() 
          } 
        }
      );
    }

    if (adminUser) {
      await recordAdminAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        adminRole: adminUser.role,
        action: `REVIEW_PROFESSION_SUGGESTION_${decision}`,
        targetRecord: suggestionId,
        targetCollection: 'profession_suggestions',
        updatedValue: { decision, reviewData }
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Review failed' };
  }
}

/**
 * Admin: Add or update a profession directly
 */
export async function upsertProfession(
  profession: Partial<MasterProfession> & { name: string; categoryId: string },
  adminUser?: { id: string; name: string; role: string }
): Promise<{ success: boolean; profession?: MasterProfession; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) return { success: false, error: 'DB unavailable' };

    const col = db.collection('professions');
    const id = profession.id || `prof-${Date.now()}`;
    const slug = profession.slug || profession.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const doc: MasterProfession = {
      id,
      slug,
      categoryId: profession.categoryId,
      subcategoryId: profession.subcategoryId || 'sub-general',
      name: profession.name,
      nameHi: profession.nameHi || profession.name,
      singular: profession.singular || profession.name,
      aliases: profession.aliases || [profession.name.toLowerCase()],
      description: profession.description || '',
      popularSkills: profession.popularSkills || [],
      baseHourlyRate: profession.baseHourlyRate || 350,
      baseDailyRate: profession.baseDailyRate || 1000,
      isRegulated: profession.isRegulated || false,
      verificationRequirements: profession.verificationRequirements || [],
      isActive: profession.isActive !== false
    };

    await col.updateOne({ id }, { $set: { ...doc, updatedAt: new Date().toISOString() } }, { upsert: true });

    if (adminUser) {
      await recordAdminAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        adminRole: adminUser.role,
        action: 'UPSERT_PROFESSION',
        targetRecord: id,
        targetCollection: 'professions',
        updatedValue: doc
      });
    }

    return { success: true, profession: doc };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to save profession' };
  }
}

/**
 * Worker: Associate multiple professions with worker profile
 */
export async function saveWorkerMultipleProfessions(
  workerProfileId: string,
  userId: string,
  professionsList: Array<{
    professionId: string;
    isPrimary: boolean;
    experienceYears?: number;
    hourlyRate?: number;
    dailyRate?: number;
    skills?: string[];
  }>
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const col = db.collection('worker_professions');
    await col.deleteMany({ workerProfileId });

    const records = professionsList.map((p, idx) => ({
      id: `wp-${workerProfileId}-${idx}-${Date.now()}`,
      workerProfileId,
      userId,
      professionId: p.professionId,
      isPrimary: p.isPrimary,
      experienceYears: p.experienceYears || 1,
      hourlyRate: p.hourlyRate || 350,
      dailyRate: p.dailyRate || 1000,
      skills: p.skills || [],
      isActive: true,
      updatedAt: new Date().toISOString()
    }));

    if (records.length > 0) {
      await col.insertMany(records);
    }
    return true;
  } catch (e) {
    console.error('[Save Worker Professions Error]:', e);
    return false;
  }
}
