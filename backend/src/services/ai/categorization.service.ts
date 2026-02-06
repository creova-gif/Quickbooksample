/**
 * AI Categorization Service
 * See /BACKEND_SAMPLES.md for full implementation
 */

import { query } from '../../db';

export class AICategorizationService {
  /**
   * Categorize transaction using AI
   */
  async categorizeTransaction(tenantId: string, data: { description: string; amount: number }) {
    // TODO: Implement OpenAI integration for smart categorization
    // See BACKEND_SAMPLES.md for complete implementation

    // For now, return a simple keyword-based categorization
    const description = data.description.toLowerCase();

    // Get categories for tenant
    const result = await query(
      'SELECT id, name FROM categories WHERE tenant_id = $1 AND type = $2 AND is_active = true LIMIT 10',
      [tenantId, 'expense']
    );

    const categories = result.rows;

    if (categories.length === 0) {
      throw new Error('No categories available');
    }

    // Simple keyword matching
    const keywords: Record<string, string[]> = {
      rent: ['rent', 'lease'],
      salaries: ['salary', 'wages', 'payroll'],
      utilities: ['electricity', 'water', 'utility'],
      marketing: ['marketing', 'advertising', 'ad'],
      transportation: ['uber', 'taxi', 'fuel', 'transport'],
    };

    let matchedCategory = categories[0]; // Default to first category
    let confidence = 0.3;

    for (const category of categories) {
      const categoryName = category.name.toLowerCase();
      const relatedKeywords = keywords[categoryName] || [categoryName];

      for (const keyword of relatedKeywords) {
        if (description.includes(keyword)) {
          matchedCategory = category;
          confidence = 0.85;
          break;
        }
      }
    }

    return {
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      confidence,
      explanation: 'Matched based on keywords',
      alternatives: [],
    };
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(
    tenantId: string,
    description: string,
    suggestedCategoryId: string,
    actualCategoryId: string
  ) {
    // TODO: Store feedback for model improvement
    // In production, this would feed into model retraining
  }
}
