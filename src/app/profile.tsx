import { ComingSoon } from '@/components/coming-soon';
import { Palette } from '@/constants/palette';

export default function ProfileScreen() {
  return (
    <ComingSoon
      eyebrow="PERFIL"
      title="Perfil"
      description="Aquí verás tu progreso, tus récords por nivel y los cosméticos que hayas comprado. Todo se guardará en Firebase."
      icon="person-outline"
      colors={Palette.cardYellow}
      shadowColor={Palette.shadowYellow}
      iconColor={Palette.navy}
      availableOn="día 4"
    />
  );
}
