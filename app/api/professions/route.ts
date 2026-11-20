import { NextRequest, NextResponse } from 'next/server';
import { 
  ensureProfessionCatalogueInitialized, 
  getDynamicCategories, 
  getDynamicProfessions 
} from '@/lib/mongodb-professions';

export async function GET(req: NextRequest) {
  try {
    await ensureProfessionCatalogueInitialized();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || undefined;
    const categoryId = searchParams.get('category') || undefined;
    const subcategoryId = searchParams.get('subcategory') || undefined;
    const tree = searchParams.get('tree') === 'true';

    const [categories, professions] = await Promise.all([
      getDynamicCategories(),
      getDynamicProfessions({ categoryId, subcategoryId, query })
    ]);

    if (tree) {
      const categoryTree = categories.map(cat => ({
        ...cat,
        professions: professions.filter(p => p.categoryId === cat.id)
      }));

      return NextResponse.json({
        success: true,
        count: professions.length,
        tree: categoryTree
      });
    }

    return NextResponse.json({
      success: true,
      count: professions.length,
      categories,
      professions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
