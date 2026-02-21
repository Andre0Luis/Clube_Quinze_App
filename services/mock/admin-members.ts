import type { MembershipTier } from "../../types/api";

export type MemberCard = {
  id: number;
  name: string;
  membershipTier: MembershipTier;
  roleLabel: string;
  avatarInitials: string;
};

export const mockMembers: MemberCard[] = [
  {
    id: 1,
    name: "Adriano Silva",
    membershipTier: "QUINZE_STANDARD",
    roleLabel: "Standard",
    avatarInitials: "AS",
  },
  {
    id: 2,
    name: "Bianca Costa",
    membershipTier: "QUINZE_PREMIUM",
    roleLabel: "Premium",
    avatarInitials: "BC",
  },
  {
    id: 3,
    name: "Carlos Nogueira",
    membershipTier: "QUINZE_STANDARD",
    roleLabel: "Standard",
    avatarInitials: "CN",
  },
  {
    id: 4,
    name: "Daniela Lopes",
    membershipTier: "QUINZE_SELECT",
    roleLabel: "Select",
    avatarInitials: "DL",
  },
  {
    id: 5,
    name: "Eduardo Martins",
    membershipTier: "QUINZE_PREMIUM",
    roleLabel: "Premium",
    avatarInitials: "EM",
  },
  {
    id: 6,
    name: "Fernanda Rocha",
    membershipTier: "QUINZE_SELECT",
    roleLabel: "Select",
    avatarInitials: "FR",
  },
];

export const findMemberById = (id: number) =>
  mockMembers.find((member) => member.id === id);
