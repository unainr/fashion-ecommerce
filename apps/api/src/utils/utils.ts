export function generateSlug(title: string): string {
  return title
	 .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip special chars
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphen
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphen
}