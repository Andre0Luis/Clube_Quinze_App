# Progresso de Integração: Redis & RabbitMQ

**VPS Analisado:** 4 GB de RAM, 1 vCPU. Recursos suficientes com sobra de memória (1-2 GB livres em IDLE). Validado para seguir!

## Estrutura (DevOps / Infra)
- [ ] Adicionar imagens do `redis:7-alpine` e `rabbitmq:3-management-alpine` no arquivo `compose.yaml`.
- [ ] Mapear portas obrigatórias no Compose (`6379`, `5672`, e `15672` do Painel Rabbit).
- [ ] Configurar credenciais base (`REDIS_HOST`, `SPRING_RABBITMQ_HOST`) conectando os serviços ao `clube-quinze-api`.

## Dependências (Maven)
- [ ] Injetar `<artifactId>spring-boot-starter-data-redis</artifactId>` no `pom.xml`.
- [ ] Injetar `<artifactId>spring-boot-starter-amqp</artifactId>` no `pom.xml`.

## Cache em Memória (Redis)
- [ ] Preencher as variáveis de Redis no `application.properties`.
- [ ] Criar arquivo `RedisCacheConfig.java` com a anotação `@EnableCaching`.
- [ ] Aplicar anotações `@Cacheable` nos Endpoints ou Services de maior gargalo de leitura (Ex: Feed de Comunidade).
- [ ] Aplicar anotações `@CacheEvict` nas lógicas de atualização para limpar o cache obsoleto do Redis.

## Filas de Processamento (RabbitMQ)
- [ ] Preencher as variáveis de RabbitMQ no `application.properties`.
- [ ] Criar arquivo `RabbitMQConfig.java` com Exchange (Direct), Queue (`notifications`) e Jackson Message Converter.
- [ ] Refatorar o disparador: `AppointmentNotificationScheduler` deixará de acionar os envios do Expo. Ele passará a usar `RabbitTemplate` para despachar DTOs da mensagem.
- [ ] Criar o Consumidor da fila (Worker Assíncrono): `NotificationConsumer.java` utilizando `@RabbitListener` - Este assumirá o papel real de falar com a EXPO e APIs de Banco.

## Validação e Encerramento
- [ ] Reiniciar o backend (`docker compose up -d --build`).
- [ ] Verificar logs (`docker logs clube-quinze-api` e conectividade dos serviços TCP novos).
- [ ] Confirmar o consumo e processamento no painel visual do RabbitMQ no navegador.
