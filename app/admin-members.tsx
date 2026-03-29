import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Border,
  Color,
  FontFamily,
  FontSize,
  Gap,
  Padding,
  StyleVariable,
} from "../GlobalStyles";
import { mockMembers } from "../services/mock/admin-members";
import { isMockEnabled } from "../services/mock/settings";
import { listUsers } from "../services/users";
import type { MembershipTier } from "../types/api";

const tierCopy: Record<MembershipTier, string> = {
  QUINZE_STANDARD: "Plano Quinze Standard",
  QUINZE_PREMIUM: "Plano Quinze Premium",
  QUINZE_SELECT: "Plano Quinze Select",
};

type PlanFilter = "ALL" | "STANDARD" | "PREMIUM" | "SELECT";

export default function AdminMembersScreen() {
  const router = useRouter();
  const { tier } = useLocalSearchParams<{ tier?: string | string[] }>();
  const [openMenuMemberId, setOpenMenuMemberId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("ALL");
  const [members, setMembers] = useState<typeof mockMembers>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedTier = useMemo(
    () => (Array.isArray(tier) ? tier[0] : tier) ?? "QUINZE_STANDARD",
    [tier],
  );
  const isSelectView = resolvedTier === "QUINZE_SELECT";

  useEffect(() => {
    let isActive = true;
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (isMockEnabled()) {
          if (isActive) setMembers(mockMembers);
          return;
        }
        const users = await listUsers();
        if (!isActive) return;

        const mapped = users.map((user) => {
          const planName = user.plan?.name ?? "";
          const lowerPlan = planName.toLowerCase();
          const roleLabel =
            user.membershipTier === "QUINZE_SELECT"
              ? "Select"
              : lowerPlan.includes("premium")
                ? "Premium"
                : lowerPlan.includes("standard")
                  ? "Standard"
                  : planName || "Standard";
          return {
            id: user.id,
            name: user.name,
            membershipTier: user.membershipTier,
            roleLabel,
            avatarInitials: (user.name || "Usuario")
              .split(" ")
              .filter(Boolean)
              .map((part: string) => part.charAt(0).toUpperCase())
              .join("")
              .slice(0, 2),
          };
        });
        setMembers(mapped);
      } catch (err: any) {
        console.error("Failed to load members", err);
        const errorMsg = err?.response?.data?.message || err.message || "Não foi possível carregar os membros.";
        if (isActive) setError(`Erro: ${errorMsg}`);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchMembers();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const base = members.filter((member) =>
      isSelectView
        ? member.membershipTier === "QUINZE_SELECT"
        : member.membershipTier === "QUINZE_STANDARD" ||
          member.membershipTier === "QUINZE_PREMIUM",
    );

    const byPlan = (() => {
      if (planFilter === "ALL") return base;
      if (planFilter === "SELECT")
        return base.filter((member) => member.roleLabel === "Select");
      if (planFilter === "PREMIUM")
        return base.filter((member) => member.roleLabel === "Premium");
      return base.filter((member) => member.roleLabel === "Standard");
    })();
    if (!searchTerm.trim()) {
      return byPlan;
    }
    const lowered = searchTerm.toLowerCase();
    return byPlan.filter((member) =>
      member.name.toLowerCase().includes(lowered),
    );
  }, [isSelectView, planFilter, searchTerm, members]);

  const totalLabel = isSelectView
    ? "Membros Quinze Select"
    : "Membros Quinze Standard e Premium";
  const planLabel = isSelectView
    ? tierCopy.QUINZE_SELECT
    : tierCopy.QUINZE_STANDARD;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={20} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membros</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{filteredMembers.length}</Text>
          <Text style={styles.metricLabel}>{totalLabel}</Text>
          <Text style={styles.metricPlan}>{planLabel}</Text>
        </View>

        {isLoading ? (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>Carregando membros...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.feedbackBanner, styles.feedbackError]}>
            <Text style={styles.feedbackText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={16} color={Color.mainTrunks} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome"
              placeholderTextColor={Color.mainTrunks}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
          </View>
          <View style={styles.filterChips}>
            {(isSelectView ? ["SELECT"] : ["ALL", "STANDARD", "PREMIUM"]).map(
              (value) => {
                const active = planFilter === value;
                const label =
                  value === "ALL"
                    ? "Todos"
                    : value === "STANDARD"
                      ? "Standard"
                      : value === "PREMIUM"
                        ? "Premium"
                        : "Select";
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setPlanFilter(value as PlanFilter)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        active && styles.chipLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Todos os membros</Text>
          {filteredMembers.map((member) => {
            const menuOpen = openMenuMemberId === member.id;
            return (
              <View key={member.id} style={styles.memberCard}>
                {menuOpen ? (
                  <Pressable
                    style={styles.memberMenuBackdrop}
                    onPress={() => setOpenMenuMemberId(null)}
                    accessibilityLabel="Fechar opcoes do membro"
                  />
                ) : null}

                <View style={styles.memberLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarLabel}>
                      {member.avatarInitials}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPlan}>{member.roleLabel}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() =>
                    setOpenMenuMemberId(menuOpen ? null : member.id)
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color={Color.mainTrunks}
                  />
                </TouchableOpacity>

                {menuOpen ? (
                  <View style={styles.memberMenu}>
                    <TouchableOpacity
                      style={styles.memberMenuItem}
                      onPress={() => {
                        setOpenMenuMemberId(null);
                        router.push({
                          pathname: "/admin-members/[memberId]",
                          params: {
                            memberId: String(member.id),
                            tier: resolvedTier,
                          },
                        });
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.memberMenuText}>Ver detalhes</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_16,
    gap: StyleVariable.gap1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_24,
    paddingBottom: 120,
    gap: Gap.gap_16,
  },
  metricCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  metricValue: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  metricLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metricPlan: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  searchRow: {
    flexDirection: "column",
    gap: Gap.gap_8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
    paddingVertical: 0,
  },
  filterChips: {
    flexDirection: "row",
    gap: Gap.gap_8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px3,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
  },
  chipActive: {
    backgroundColor: "#EEF5FF",
    borderColor: Color.piccolo,
  },
  chipLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  chipLabelActive: {
    color: Color.piccolo,
    fontFamily: FontFamily.dMSansBold,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderTopWidth: 1,
    borderTopColor: "#E6EAF1",
    backgroundColor: Color.mainGoten,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: Gap.gap_4,
  },
  navLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  navLabelActive: {
    color: Color.piccolo,
    fontFamily: FontFamily.dMSansBold,
  },
  listSection: {
    gap: Gap.gap_12,
  },
  listTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  feedbackBanner: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  feedbackError: {
    borderColor: Color.supportiveChichi,
  },
  feedbackText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  memberCard: {
    position: "relative",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.gap_8,
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  memberInfo: {
    gap: Gap.gap_4,
  },
  memberName: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  memberPlan: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  moreButton: {
    padding: StyleVariable.px2,
  },
  memberMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  memberMenu: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Color.mainGohan,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    shadowColor: "rgba(0,0,0,0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
    minWidth: 140,
    zIndex: 2,
  },
  memberMenuItem: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
  },
  memberMenuText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
});

