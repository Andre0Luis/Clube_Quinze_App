# Jornada do usuário — Clube Quinze

Validação feita no **simulador iPhone 17 Pro (iOS 26.3)**, com o app de desenvolvimento apontando para um backend local
com a versão nova (migration V19, expediente até 22h). Contas usadas: **admin** (`aluis283@gmail.com`) e **cliente Select**
(`andre_luis.t@hotmail.com`). Os prints estão em [`docs/jornada/`](jornada/).

> Os dados são de teste (banco em memória). Nada foi feito em produção.

---

## 1. Jornada do cliente (membro)

| # | Passo | O que acontece | Print |
|---|---|---|---|
| 1 | Entra no app | Home com saudação, **sino com selo vermelho** de notificações não lidas e o card "próximo agendamento" | ![](jornada/cliente-01-home.png) |
| 2 | Chega perto do horário | Aparece, no topo da home, o card **"Confirme seu atendimento"** com **Confirmar presença / Pedir remarcação / Cancelar** (regra: atendimento ainda "Agendado" e faltando até 3 h; o aviso por push/e-mail sai 1h30 antes) | ![](jornada/cliente-02-home-confirmar.png) |
| 3 | Toca em **Confirmar presença** | O status vira **Confirmado** (verde) e o card de confirmação some | ![](jornada/cliente-03-confirmado.png) |
| 4 | Olha o próximo atendimento | Mostra a **contagem regressiva** ("em 1h16") | ![](jornada/cliente-04-home-contagem.png) |
| 5 | Abre o sino | Notificações separadas em **Novas / Anteriores**, com tempo relativo ("há 3 h") e dica "Toque para ver o agendamento" | ![](jornada/cliente-05-notificacoes.png) |
| 6 | Toca numa notificação | Abre o **detalhe do agendamento** certo (a notificação passa a ser marcada como lida) | ![](jornada/cliente-06-detalhe.png) |
| 7 | Aba **Reserva** | Lista de agendamentos. Se a lista falhar, mostra "Não foi possível carregar" com **Tentar novamente** (antes mostrava "nenhum horário", enganoso) | ![](jornada/cliente-07-reserva.png) |
| 8 | **Pedir remarcação** | Escolhe a data e o horário (só horários livres) | ![](jornada/cliente-09-pedir-remarcacao.png) |
| 9 | Revisa e confirma | Resumo da data, horário e preferências | ![](jornada/cliente-10-revisar.png) |
| 10 | Pedido enviado | Mensagem clara: o horário atual continua reservado até o clube decidir | ![](jornada/cliente-11-pedido-enviado.png) |
| 11 | Volta à home | Selo laranja **"Remarcação em análise"** | ![](jornada/cliente-12-home-aguardando.png) |
| 12 | Perfil | Dados, plano (agora com nome legível), preferências, notificações, senha, termos e **Sair** | ![](jornada/cliente-13-perfil.png) |

### Estados do agendamento (cores)
Agendado (cinza-azulado) → Confirmado (verde) → Concluído (cinza) · Remarcação em análise (laranja) · Cancelado (vermelho).

---

## 2. Jornada do administrador

| # | Passo | O que acontece | Print |
|---|---|---|---|
| 1 | Entra no app | Home com o card **Hoje** (atendimentos do dia, quantos a confirmar, próximo horário) | ![](jornada/admin-17-home-resumo.png) |
| 2 | Rola a home | Abaixo de "Meus agendamentos" ficam **Solicitações de remarcação** (com contador laranja) e **Cadastrar usuário** (quadrado), lado a lado | ![](jornada/admin-21-home-cards-novos.png) |
| 3 | Mais abaixo | **Produtos Quinze** agora vem antes de **Passos Mágicos** | ![](jornada/admin-23-cards-produtos-passos.png) |
| 4 | Abre o sino | Notificação do pedido com "Toque para responder" | ![](jornada/admin-04-notificacoes.png) |
| 5 | Toca na notificação | Abre o **agendamento do cliente** que pediu a remarcação (não mais uma lista genérica) | ![](jornada/admin-05-detalhe-pedido.png) |
| 6 | Vê as ações | **Aprovar remarcação** (com duração), **Escolher outro horário**, **Recusar pedido** e **Cancelar atendimento** | ![](jornada/admin-06-detalhe-botoes.png) |
| 7 | **Recusar** | Pede o motivo (opcional) e tem **Voltar / Confirmar recusa** — não recusa por engano | ![](jornada/admin-07-recusar-motivo.png) |
| 8 | **Aprovar** | Mostra confirmação em verde e o cliente é avisado | ![](jornada/admin-08-aprovado.png) |
| 9 | Aba **Agenda** | Calendário do mês, próximo cliente e **filtros**: Todos · A confirmar · Confirmados · Remarcação | ![](jornada/admin-18-agenda-filtros.png) |
| 10 | Filtra "A confirmar" | Estado vazio específico do filtro | ![](jornada/admin-19-filtro-a-confirmar.png) |
| 11 | Toca num atendimento | Abre o detalhe com as ações do status (Agendado: **Confirmar presença / Remarcar / Cancelar**) | ![](jornada/admin-11-detalhe-agendado.png) |
| 12 | Contato com o cliente | Botões **WhatsApp** e **Ligar** no detalhe | ![](jornada/admin-20-detalhe-contato.png) |
| 13 | **Remarcar** | Escolhe data e duração; grade de 15 em 15 min | ![](jornada/admin-12-remarcar.png) |
| 14 | Horários até **22h** | Para 1 h, o último início é 21:00 (termina 22:00) | ![](jornada/admin-13-horarios-22h.png) |
| 15 | Solicitações | Lista com os pedidos, duração, motivo e **Ver detalhes** | ![](jornada/admin-22-solicitacoes-2.png) |
| 16 | Confirmação | Configura quando pedir confirmação (1h30 antes) e quando avisar o admin | ![](jornada/admin-25-confirmacao-config.png) |
| 17 | Membros / Pagamentos / Comunidade | Listas e telas de apoio | ![](jornada/admin-26-membros.png) ![](jornada/admin-27-pagamentos.png) ![](jornada/admin-24-comunidade.png) |
| 18 | Perfil | Dados, ambiente (só admin) e **Sair** | ![](jornada/admin-16-perfil.png) |

---

## 3. E-mails do backend (conferidos na caixa de entrada)

| E-mail | Resultado |
|---|---|
| Recuperação de senha | Chega com o logo, o botão **Redefinir Senha** redireciona (302) para `clubequinzeapp.cloud/reset-password?token=…`, que abre a página (200) |
| Lembretes de agendamento (amanhã / 3 h / 1 h / 30 min) | Chegam com o cabeçalho e a data corretos; o logo vai embutido |
| Logo `https://clubequinzeapp.cloud/assets/logo-email.png` | 200, PNG 512×512 |

Pontos encontrados e tratados: caminhos inexistentes respondiam **500** (agora 404) e token de usuário excluído gerava 500 (agora 401).

---

## 4. O que mudou nesta rodada

**Pedidos da sessão**
- Selo vermelho de não lidas no sino · ordem dos cards (Produtos Quinze ↔ Passos Mágicos).
- Admin: card de solicitações + cadastrar usuário quadrado · toque na agenda, nas solicitações e nas notificações abre o agendamento do cliente com **aprovar / recusar / outro horário / cancelar**.
- Notificação guarda o agendamento (migration V19) para abrir a tela certa · expediente até **22h**.
- Cliente: card de confirmação na home (confirmar, cancelar ou pedir remarcação).

**Melhorias de experiência (as 5 implementadas)**
1. **Resumo "Hoje"** na home do admin (atendimentos, a confirmar, próximo horário).
2. **Puxar para atualizar** na home (admin e cliente) e atualização automática ao voltar.
3. **Filtros por status** na agenda do admin.
4. **Notificações** agrupadas em Novas/Anteriores, com tempo relativo e contador de não lidas.
5. **Contato rápido** (WhatsApp / ligar) no agendamento do cliente + **contagem regressiva** no próximo atendimento.

**Correções de navegação e texto**
- A aba do meio do admin chama-se **Agenda** e fica destacada (antes mostrava "Reserva" e a Home acesa).
- Voltar a partir de uma notificação (app aberto sem histórico) leva à Home.
- Detalhe do agendamento deixa folga para a barra de abas não cobrir o último botão.
- Nome do plano legível ("Quinze Standard" em vez de `QUINZE_STANDARD`).
- "e o seu próximo cliente" → "é o seu próximo cliente".

---

## 5. Sugestões para a próxima rodada

### Interações por tela (auditoria)
- **Login:** mostrar/ocultar senha já existe; falta "lembrar e-mail" e biometria (Face ID) para o admin.
- **Home do cliente:** sem agendamento futuro, avaliar um botão "Agendar" em destaque (hoje depende da flag `BOOKING_ENABLED`).
- **Reserva:** quando o dia não tem horário livre, a tela só diz "Nenhum horário disponível"; sugerir o próximo dia com vaga.
- **Revisar agendamento:** exibir a duração e o serviço; hoje só data/horário/preferências.
- **Perfil:** "Versão" do rodapé fica atrás da barra de abas ao rolar até o fim.
- **Comunidade:** estado vazio sem ação; sugerir "Publicar o primeiro post".
- **Admin > Pagamentos:** mostrar o valor/plano reais (hoje "R$ 0,00") e ordenar por vencimento.

### 5 ideias de funcionalidade
1. **Confirmar ou cancelar direto na notificação** (botões na tela de bloqueio do iPhone/Android, sem abrir o app) — reduz o esforço do cliente e o "não compareceu".
2. **Lista de espera automática:** se um horário é cancelado, avisar quem quis aquele dia; o admin preenche a agenda sozinho.
3. **Remarcação em lote para o admin** (ex.: dia que o barbeiro não pode atender): escolher o dia, o app propõe novos horários e avisa todos os clientes de uma vez.
4. **Histórico e preferências do cliente na agenda do admin:** último serviço, observações e frequência, para o atendimento já começar personalizado.
5. **Painel de números do admin:** taxa de comparecimento, cancelamentos por semana, horários mais procurados e receita prevista dos planos.

### Pendências técnicas (não são do app)
- O **Xcode Cloud falhou** no Build 36 (`Pods-ClubeQuinzeApp.release.xcconfig` não encontrado). Foi adicionado `ios/ci_scripts/ci_post_clone.sh`, que instala node e pods antes de compilar — precisa ser testado num novo build.
- O `develop` do app estava sem o commit de versão 1.20.0 (só em `main`); a branch desta rodada já inclui esse retro-merge.
- `/.well-known/apple-app-site-association` e `assetlinks.json` não existem: sem eles o link de redefinir senha abre no navegador, não no app.
