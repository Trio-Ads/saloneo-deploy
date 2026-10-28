// Sample salons with photos (ours, AI-generated, in /public/images/samples/<kit>/), one per trade,
// so template previews look like a real page. Never used on real public salon pages.
import { DesignTemplate } from './types';
import { PublicService, SalonPublicData } from '../public/types';

export const sampleKits = ['coiffure', 'barbier', 'afro', 'ongles', 'bienetre', 'mariage'] as const;
export type SampleKit = typeof sampleKits[number];

type Service = [name: string, description: string, category: string, duration: number, price: number];
type Member = [firstName: string, lastName: string, role: string, specialties: string[]];
type Review = [author: string, rating: 1 | 2 | 3 | 4 | 5, comment: string];

interface Kit {
  name: string;
  description: string;
  presentation: string;
  address: string;
  phone: string;
  services: Service[];
  team: Member[];
  reviews: Review[];
}

const kits: Record<SampleKit, Kit> = {
  coiffure: {
    name: 'Maison Lina',
    description: 'Coupe, couleur et soins du cheveu au cœur d’Alger.',
    presentation: 'Depuis 2014, Maison Lina travaille la couleur à la main et la coupe sur mesure, dans un appartement lumineux de la rue Didouche Mourad.',
    address: '12 rue Didouche Mourad, Alger-Centre',
    phone: '0550 12 34 56',
    services: [
      ['Coupe & brushing', 'Coupe sur mesure, shampoing soin et brushing.', 'Coupe', 60, 2500],
      ['Balayage', 'Éclaircissement à main levée, patine et soin.', 'Couleur', 180, 9000],
      ['Coloration', 'Couleur complète racines et longueurs.', 'Couleur', 120, 6000],
      ['Lissage kératine', 'Cheveux disciplinés et brillants jusqu’à quatre mois.', 'Soins', 150, 12000],
      ['Chignon', 'Attache travaillée pour une soirée ou une cérémonie.', 'Coiffage', 60, 4000],
      ['Shampoing & soin profond', 'Diagnostic, masque nourrissant et massage du cuir chevelu.', 'Soins', 30, 1500],
    ],
    team: [
      ['Lina', 'Benali', 'Fondatrice, coiffeuse', ['Coupe', 'Brushing']],
      ['Samia', 'Kaci', 'Coloriste', ['Balayage', 'Couleur']],
      ['Karim', 'Mansouri', 'Coiffeur', ['Coupe', 'Lissage']],
      ['Inès', 'Haddad', 'Styliste', ['Chignon', 'Coiffage']],
    ],
    reviews: [
      ['Nadia B.', 5, 'Samia a trouvé exactement le blond que je voulais. Résultat lumineux.'],
      ['Yasmine K.', 5, 'Coupe parfaite, je ne vais plus ailleurs.'],
      ['Imane D.', 4, 'Très professionnel, un peu d’attente le samedi.'],
      ['Rym A.', 5, 'Mon lissage tient depuis trois mois.'],
    ],
  },
  barbier: {
    name: 'Le Barbier d’Hydra',
    description: 'Coupes, dégradés et rasage à l’ancienne à Hydra.',
    presentation: 'Un salon d’hommes à l’ancienne : fauteuils en cuir, serviettes chaudes et lames affûtées, avec ou sans rendez-vous.',
    address: '7 rue des Frères Oughlis, Hydra, Alger',
    phone: '0661 45 78 12',
    services: [
      ['Dégradé', 'Fade à la tondeuse, finitions aux ciseaux.', 'Coupe', 40, 1200],
      ['Taille de barbe', 'Mise en forme, contours et huile.', 'Barbe', 30, 800],
      ['Rasage serviette chaude', 'Rasage traditionnel au coupe-chou, serviettes chaudes.', 'Barbe', 40, 1500],
      ['Coupe & barbe', 'La coupe et la barbe en une séance.', 'Coupe', 60, 1800],
      ['Contours', 'Line-up net du front et de la nuque.', 'Coupe', 15, 500],
      ['Coupe enfant', 'Pour les moins de 12 ans.', 'Coupe', 30, 700],
    ],
    team: [
      ['Yacine', 'Belkacem', 'Maître barbier', ['Rasage', 'Barbe']],
      ['Sofiane', 'Ait Ali', 'Barbier', ['Dégradé', 'Contours']],
      ['Amine', 'Cherif', 'Barbier', ['Coupe classique']],
      ['Walid', 'Ziani', 'Barbier', ['Dégradé', 'Coupe enfant']],
    ],
    reviews: [
      ['Mehdi R.', 5, 'Meilleur dégradé d’Alger, propre et rapide.'],
      ['Riad B.', 5, 'Le rasage à la serviette chaude, un vrai moment.'],
      ['Nassim T.', 4, 'Bonne ambiance, il vaut mieux réserver le jeudi.'],
    ],
  },
  afro: {
    name: 'Studio Kinky',
    description: 'Tresses, locks et boucles naturelles à Alger.',
    presentation: 'Un studio dédié aux cheveux texturés : tresses, locks, boucles définies et soins naturels, sans produits agressifs.',
    address: '24 boulevard Krim Belkacem, Télemly, Alger',
    phone: '0770 32 18 64',
    services: [
      ['Box braids knotless', 'Tresses sans nœud, longueur mi-dos.', 'Tresses', 300, 12000],
      ['Retwist locks', 'Entretien des racines et coiffage.', 'Locks', 120, 5000],
      ['Boucles définies', 'Wash and go, définition et hydratation.', 'Boucles', 90, 4000],
      ['Cornrows', 'Nattes collées, motif au choix.', 'Tresses', 120, 4500],
      ['Silk press', 'Lissage sans produit chimique, brillance et mouvement.', 'Lissage', 120, 6000],
      ['Soin naturel', 'Bain d’huile, masque et protection des longueurs.', 'Soins', 60, 3000],
    ],
    team: [
      ['Aïcha', 'Diallo', 'Tresseuse', ['Box braids', 'Cornrows']],
      ['Nour', 'Benamar', 'Spécialiste boucles', ['Wash and go', 'Soins']],
      ['Moussa', 'Keita', 'Loctician', ['Locks', 'Retwist']],
      ['Fatou', 'Sow', 'Coiffeuse styliste', ['Silk press', 'Coiffage']],
    ],
    reviews: [
      ['Mariam S.', 5, 'Enfin un salon qui comprend mes boucles.'],
      ['Leila O.', 5, 'Tresses nettes, ça tient depuis six semaines.'],
      ['Grace N.', 4, 'Long mais le résultat en vaut la peine.'],
    ],
  },
  ongles: {
    name: 'Atelier Nacre',
    description: 'Ongles, cils et sourcils à Ben Aknoun.',
    presentation: 'Un atelier calme pour les mains, les pieds et le regard : semi-permanent, nail art et rehaussement de cils, sur rendez-vous.',
    address: '3 route de Ben Aknoun, El Biar, Alger',
    phone: '0555 64 21 09',
    services: [
      ['Semi-permanent nude', 'Mise en forme, cuticules et pose couleur.', 'Mains', 60, 2200],
      ['Nail art', 'Motifs dessinés à la main, sur gel.', 'Mains', 90, 3500],
      ['French manucure', 'Le classique, en semi-permanent.', 'Mains', 60, 2500],
      ['Pédicure spa', 'Bain, gommage, massage et vernis.', 'Pieds', 60, 2800],
      ['Rehaussement de cils & sourcils', 'Courbure, teinture et restructuration.', 'Regard', 60, 3500],
      ['Rouge cerise', 'Pose couleur intense, tenue trois semaines.', 'Mains', 45, 1800],
    ],
    team: [
      ['Amel', 'Saidi', 'Prothésiste ongulaire', ['Nail art', 'Gel']],
      ['Sarah', 'Meziane', 'Technicienne ongles', ['Semi-permanent']],
      ['Lydia', 'Hamidi', 'Technicienne cils & sourcils', ['Rehaussement']],
      ['Dounia', 'Brahimi', 'Pédicure', ['Pédicure spa']],
    ],
    reviews: [
      ['Imane K.', 5, 'Ma manucure a tenu trois semaines.'],
      ['Sonia M.', 5, 'Nail art magnifique, très précis.'],
      ['Hana T.', 4, 'Salon propre et calme, je reviendrai.'],
      ['Kenza L.', 5, 'Rehaussement de cils réussi, regard ouvert.'],
    ],
  },
  bienetre: {
    name: 'Dar Essafa',
    description: 'Soins du visage, massages et hammam à Kouba.',
    presentation: 'Un institut et hammam où l’on prend le temps : soins du visage, gommage au savon noir et massages aux pierres chaudes.',
    address: '15 rue Garidi, Kouba, Alger',
    phone: '0560 87 43 25',
    services: [
      ['Soin du visage éclat', 'Nettoyage, gommage, masque et massage.', 'Visage', 60, 3500],
      ['Massage aux pierres chaudes', 'Détente profonde, huiles chaudes.', 'Massage', 75, 6000],
      ['Gommage hammam', 'Savon noir, kessa et rhassoul.', 'Hammam', 60, 3000],
      ['Soin hydratant corps', 'Enveloppement et crème nourrissante.', 'Corps', 45, 2800],
      ['Épilation visage', 'Au fil ou à la cire.', 'Esthétique', 20, 600],
      ['Massage relaxant', 'Massage à l’huile d’argan, corps entier.', 'Massage', 60, 4500],
    ],
    team: [
      ['Meriem', 'Bouzid', 'Esthéticienne', ['Soins visage']],
      ['Selma', 'Rahmani', 'Masseuse', ['Pierres chaudes', 'Massage']],
      ['Nesrine', 'Larbi', 'Esthéticienne', ['Épilation', 'Soins corps']],
      ['Hayet', 'Djebbar', 'Responsable hammam', ['Gommage', 'Hammam']],
    ],
    reviews: [
      ['Lydia C.', 5, 'Peau lumineuse pendant une semaine.'],
      ['Wafa H.', 5, 'Le gommage au hammam, un rituel.'],
      ['Amina Z.', 4, 'Très bon massage, cabine un peu petite.'],
    ],
  },
  mariage: {
    name: 'Lalla Négafa',
    description: 'Maquillage, coiffure et henné pour la mariée.',
    presentation: 'Nous préparons la mariée de l’essai à la dernière tenue : maquillage, chignon, henné et habillage en karakou.',
    address: '9 rue Larbi Ben M’hidi, Alger-Centre',
    phone: '0550 98 76 54',
    services: [
      ['Maquillage mariée', 'Essai inclus, tenue toute la nuit.', 'Mariée', 90, 15000],
      ['Chignon mariée & voile', 'Chignon travaillé et pose du voile.', 'Mariée', 90, 10000],
      ['Soirée henné', 'Motifs traditionnels, mains et pieds.', 'Henné', 120, 8000],
      ['Habillage karakou', 'Habillage et accessoires pour chaque tenue.', 'Négafa', 60, 12000],
      ['Maquillage invitée', 'Pour la famille et les demoiselles d’honneur.', 'Invitées', 60, 4000],
      ['Coiffure & accessoires', 'Bijoux de tête et coiffure assortie.', 'Mariée', 60, 6000],
    ],
    team: [
      ['Kenza', 'Bensalem', 'Maquilleuse mariée', ['Maquillage']],
      ['Rania', 'Ouali', 'Coiffeuse mariée', ['Chignon', 'Voile']],
      ['Zahia', 'Mebarki', 'Négafa', ['Karakou', 'Habillage']],
      ['Chahinez', 'Boudiaf', 'Artiste henné', ['Henné']],
    ],
    reviews: [
      ['Sonia M.', 5, 'Maquillage parfait, il a tenu jusqu’au bout de la nuit.'],
      ['Nawel B.', 5, 'Zahia a géré mes cinq tenues sans stress.'],
      ['Asma R.', 5, 'Henné fin et élégant, toute la famille a adoré.'],
    ],
  },
};

const day = { start: '09:00', end: '19:00' };
const hours = { saturday: day, sunday: day, monday: day, tuesday: day, wednesday: day, thursday: { start: '09:00', end: '20:00' } };
const reviewDates = ['2026-10-18', '2026-10-02', '2026-09-21', '2026-08-30'];

function build(kit: SampleKit): SalonPublicData {
  const k = kits[kit];
  const dir = `/images/samples/${kit}`;
  return {
    profile: {
      _id: `sample-${kit}`,
      slug: `sample-${kit}`,
      establishmentName: k.name,
      description: k.description,
      presentation: k.presentation,
      address: k.address,
      publicPhone: k.phone,
      banner: `${dir}/banner.webp`,
      businessHours: hours,
      settings: { currency: 'DZD' },
      showTeamOnPublicPage: true,
    },
    services: k.services.map(([name, description, category, duration, price], i): PublicService => ({
      _id: `s${i + 1}`, name, description, category, duration, price,
      images: [{ url: `${dir}/s${i + 1}.webp`, alt: name, isPrimary: true }],
    })),
    team: k.team.map(([firstName, lastName, role, specialties], i) => ({
      _id: `t${i + 1}`, firstName, lastName, role, specialties, avatar: `${dir}/t${i + 1}.webp`,
    })),
    reviews: k.reviews.map(([author, rating, comment], i) => ({ _id: `r${i + 1}`, author, rating, comment, date: reviewDates[i] })),
  };
}

export const sampleSalons = Object.fromEntries(sampleKits.map((k) => [k, build(k)])) as Record<SampleKit, SalonPublicData>;

/** The photo kit matching a template's trade; anything not trade-specific uses coiffure. */
export function kitOf(template: Pick<DesignTemplate, 'family' | 'category'>): SampleKit {
  const { family, category } = template;
  if (family === 'barbier' || category === 'barbier') return 'barbier';
  if (family === 'afro-texture') return 'afro';
  if (family === 'ongles-cils' || category === 'ongles') return 'ongles';
  if (family === 'spa-hammam' || family === 'institut' || category === 'bien-etre') return 'bienetre';
  if (family === 'mariage' || category === 'mariage') return 'mariage';
  return 'coiffure';
}

export const sampleSalonFor = (template: Pick<DesignTemplate, 'family' | 'category'>) => sampleSalons[kitOf(template)];

/** The same salon without any photo (banner, service images, avatars). */
export const withoutPhotos = (d: SalonPublicData): SalonPublicData => ({
  ...d,
  profile: { ...d.profile, banner: undefined },
  services: d.services.map((s) => ({ ...s, images: [] })),
  team: d.team.map((m) => ({ ...m, avatar: undefined })),
});
