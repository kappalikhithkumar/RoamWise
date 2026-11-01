export interface CategoryStyle {
  gradient: string;
  icon: string;
}

/**
 * Returns a category-specific background gradient and Material Symbol icon
 * to display when an activity or landmark lacks a photographic imageUrl.
 */
export function getCategoryGradientAndIcon(category: string = ''): CategoryStyle {
  const cat = (category || '').toLowerCase().trim();

  if (cat.includes('museum') || cat.includes('gallery') || cat.includes('art')) {
    return { gradient: 'from-amber-600 to-orange-700', icon: 'museum' };
  }
  if (cat.includes('fort') || cat.includes('castle') || cat.includes('citadel') || cat.includes('ruins')) {
    return { gradient: 'from-amber-700 to-stone-800', icon: 'fort' };
  }
  if (cat.includes('palace') || cat.includes('heritage') || cat.includes('monument') || cat.includes('history')) {
    return { gradient: 'from-purple-700 to-indigo-900', icon: 'account_balance' };
  }
  if (
    cat.includes('temple') ||
    cat.includes('spiritual') ||
    cat.includes('mosque') ||
    cat.includes('church') ||
    cat.includes('gurdwara')
  ) {
    return { gradient: 'from-orange-500 to-amber-700', icon: 'temple_hindu' };
  }
  if (
    cat.includes('nature') ||
    cat.includes('park') ||
    cat.includes('garden') ||
    cat.includes('reserve') ||
    cat.includes('wildlife')
  ) {
    return { gradient: 'from-emerald-600 to-teal-800', icon: 'forest' };
  }
  if (
    cat.includes('beach') ||
    cat.includes('water') ||
    cat.includes('lake') ||
    cat.includes('falls') ||
    cat.includes('coastal')
  ) {
    return { gradient: 'from-cyan-600 to-blue-800', icon: 'water' };
  }
  if (
    cat.includes('food') ||
    cat.includes('market') ||
    cat.includes('dining') ||
    cat.includes('cafe') ||
    cat.includes('culinary')
  ) {
    return { gradient: 'from-rose-500 to-red-700', icon: 'restaurant' };
  }
  if (
    cat.includes('adventure') ||
    cat.includes('viewpoint') ||
    cat.includes('trek') ||
    cat.includes('outdoor')
  ) {
    return { gradient: 'from-emerald-700 to-cyan-900', icon: 'landscape' };
  }
  if (cat.includes('relax') || cat.includes('leisure') || cat.includes('spa')) {
    return { gradient: 'from-teal-600 to-emerald-800', icon: 'self_improvement' };
  }
  return { gradient: 'from-[#1A4D3E] to-[#204E43]', icon: 'location_on' };
}
