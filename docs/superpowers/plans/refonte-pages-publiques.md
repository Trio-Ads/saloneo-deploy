# Refonte des pages publiques Saloneo

**Status: COMPLETED** (2026-04-19)

## Objectif

Refonte complète des pages publiques Saloneo : architecture de sections composables, redesign UX des composants de réservation, système d'avis clients end-to-end.

## Tasks

| # | Tâche | Status |
|---|-------|--------|
| 1 | Nouveaux types DesignTemplate | ✅ completed |
| 2 | Ajouter `sections` aux 10 templates existants | ✅ completed |
| 3 | Interface SalonPublicData + hook useSalonPublicData | ✅ completed |
| 4 | SalonPageRenderer — orchestrateur de sections | ✅ completed |
| 5 | Refactoring SalonPage.tsx | ✅ completed |
| 6 | HeroSection — 5 variantes | ✅ completed |
| 7 | ServicesSection — 5 variantes | ✅ completed |
| 8 | TeamSection — 4 variantes | ✅ completed |
| 9 | ContactSection — 3 variantes | ✅ completed |
| 10 | PublicNavbar + PublicFooter adaptés au template | ✅ completed |
| 11 | PublicBookingFlow — héritage template | ✅ completed |
| 12 | DateTimeSelection — redesign UX | ✅ completed |
| 13 | BookingConfirmation — redesign | ✅ completed |
| 14 | Page /appointment/:token — redesign | ✅ completed |
| 15 | Modèle Review + API backend | ✅ completed |
| 16 | ReviewsSection — 4 variantes frontend | ✅ completed |
| 17 | Onglet "Avis clients" dans Mon Interface | ✅ completed |
| 18 | Vérification end-to-end + commit final | ✅ completed |

## Architecture clé

- **Composable sections**: `SalonPageRenderer` dispatche vers des composants variants selon `template.sections[x].variant`
- **SectionProps**: `{ template: DesignTemplate; data: SalonPublicData; onBook: (serviceId: string) => void }`
- **Reviews**: modèle MongoDB (`beauty-flow-backend/src/models/Review.ts`), routes `/api/reviews` (CRUD auth) et `/api/public/reviews/:slug` (public)
- **ReviewsSection variants**: Carousel, Masonry, Ticker, Featured
- **ReviewsManager**: onglet "Avis clients" dans InterfacePage

## Tag git

`v-public-redesign-complete`
