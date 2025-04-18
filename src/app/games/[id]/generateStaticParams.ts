// This function generates the static paths for all game IDs
export async function generateStaticParams() {
  // Since we can't know all game IDs at build time (they're created dynamically),
  // we'll create a placeholder that will be replaced with client-side navigation
  return [{ id: 'placeholder' }];
}
