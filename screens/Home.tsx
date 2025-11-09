import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Border,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  Padding,
  StyleVariable,
} from '../GlobalStyles';
import api from '../services/api';

interface DecodedToken {
  name?: string;
}

interface UserProfile {
  name?: string;
}

const quickActions = [
  { label: 'Agendar horario', icon: 'calendar-outline', href: '/schedule' },
  { label: 'Meus agendamentos', icon: 'list-outline', href: '/appointments' },
  { label: 'Preferencias', icon: 'options-outline', href: '/preferences' },
  { label: 'Meu plano', icon: 'card-outline', href: '/plan' },
] as const;

const featureCards = [
  {
    id: 'social',
    backgroundColor: '#E7F6ED',
    tag: 'Responsabilidade Social',
    title: 'Passos Magicos',
    description: 'Participe das nossas acoes e compartilhe experiencias com nossos alunos.',
  },
  {
    id: 'products',
    backgroundColor: '#E6F2FF',
    tag: 'Produtos Quinze',
    title: 'Autocuidado premium',
    description: 'Descubra a linha que leva o autocuidado masculino a outro nivel.',
  },
] as const;

const formatUpcomingAppointment = () => {
  const target = new Date();
  target.setDate(target.getDate() + 2);
  target.setHours(15, 30, 0, 0);

  const weekday = target.toLocaleDateString('pt-BR', { weekday: 'long' });
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const datePart = target.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const timePart = target.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `${formattedWeekday}, ${datePart} • ${timePart}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded?.name && isMounted) {
          setUserName(decoded.name);
        }

        const { data } = await api.get<UserProfile>('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) {
          return;
        }

        if (data?.name) {
          setUserName(data.name);
        }
      } catch (error) {
        console.warn('Falha ao obter dados do usuário', error);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = useMemo(() => userName || 'Convidado', [userName]);
  const appointmentSubtitle = useMemo(() => formatUpcomingAppointment(), []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              contentFit="cover"
            />
            <View>
              <Text style={styles.greeting}>Ola, {displayName}</Text>
              <Text style={styles.greetingSubtitle}>Bem-vindo ao Clube Quinze</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            accessibilityRole="button"
            accessibilityLabel="Ver notificacoes"
          >
            <Ionicons name="notifications-outline" size={20} color={Color.mainGoten} />
          </TouchableOpacity>
        </View>

        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <View style={styles.highlightIconWrapper}>
              <Ionicons name="calendar" size={20} color={Color.mainGoten} />
            </View>
            <View style={styles.highlightTag}>
              <Text style={styles.highlightTagText}>Agendado</Text>
            </View>
          </View>
          <Text style={styles.highlightTitle}>Seu proximo cuidado pessoal</Text>
          <Text style={styles.highlightSubtitle}>{appointmentSubtitle}</Text>
          <TouchableOpacity style={styles.highlightAction}>
            <Text style={styles.highlightActionText}>Ver detalhes</Text>
            <Ionicons name="arrow-forward" size={18} color={Color.mainGoten} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => router.push(item.href)}
            >
              <Ionicons name={item.icon} size={28} color={Color.piccolo} />
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.communityCard} activeOpacity={0.85}>
          <View style={styles.communityIconWrapper}>
            <Ionicons name="people" size={24} color={Color.piccolo} />
          </View>
          <View style={styles.communityContent}>
            <Text style={styles.communityTitle}>Comunidade Quinze</Text>
            <Text style={styles.communitySubtitle}>
              Descubra as ultimas novidades e participe das discussoes.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Color.piccolo} />
        </TouchableOpacity>

        <View style={styles.cardsRow}>
          {featureCards.map((card) => (
            <View key={card.id} style={[styles.smallCard, { backgroundColor: card.backgroundColor }]}>
              <Text style={styles.smallCardTag}>{card.tag}</Text>
              <Text style={styles.smallCardTitle}>{card.title}</Text>
              <Text style={styles.smallCardText}>{card.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_24,
    gap: StyleVariable.gap2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: StyleVariable.px6,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StyleVariable.gap2,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: Border.br_24,
  },
  greeting: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  greetingSubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    backgroundColor: Color.piccolo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCard: {
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px6,
    backgroundColor: Color.piccolo,
    gap: StyleVariable.gap2,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTag: {
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px2,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIXs,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  highlightTagText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  highlightTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  highlightSubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  highlightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StyleVariable.gap1,
  },
  highlightActionText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
    textDecorationLine: 'underline',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: StyleVariable.px4,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
    backgroundColor: '#E8F0F2',
    gap: StyleVariable.gap2,
  },
  actionLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StyleVariable.gap2,
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
    backgroundColor: '#F3E8FF',
  },
  communityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Border.br_58,
    backgroundColor: '#E2D4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityContent: {
    flex: 1,
    gap: StyleVariable.gap1,
  },
  communityTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  communitySubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: StyleVariable.px4,
  },
  smallCard: {
    flex: 1,
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
    gap: StyleVariable.gap1,
  },
  socialCard: {
    backgroundColor: '#E7F6ED',
  },
  productsCard: {
    backgroundColor: '#E6F2FF',
  },
  smallCardTag: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  smallCardTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  smallCardText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
});
