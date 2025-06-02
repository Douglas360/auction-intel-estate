export function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove apenas acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // Substitui tudo que não for letra/número por hífen
    .replace(/(^-|-$)+/g, '');       // Remove hífens do início/fim
} 