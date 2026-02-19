import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Color, FontFamily, FontSize, Border, Padding } from '../GlobalStyles';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSend?: (email: string) => void;
}

export default function ForgotPasswordModal({ visible, onClose, onSend }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (onSend) onSend(email);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.indicator} />
          <Text style={styles.title}>Esqueceu sua senha?</Text>
          <Text style={styles.description}>
            Se você alterar sua senha, não poderá retirar sua conta por 48 horas por motivos de segurança.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor={Color.mainTrunks}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, !email && styles.buttonDisabled]}
            disabled={!email}
            onPress={handleSend}
          >
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Padding.padding_24,
    alignItems: 'center',
  },
  indicator: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5E5',
    marginBottom: 24,
  },
  title: {
    fontSize: FontSize.fs_20,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: Border.br_12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: Border.br_12,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: '#fff',
  },
});
