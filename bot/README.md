# 🤖 Como Configurar o Robô Grátis no Oracle Cloud (Always Free)

Este robô roda 24 horas por dia, 7 dias por semana, infinitamente na nuvem da Oracle de forma 100% gratuita, minerando ofertas e postando diretamente no seu Supabase com seus links de afiliados.

---

### Passo 1: Criar a Instância Gratuita na Oracle Cloud
1. Acesse o console da **Oracle Cloud** (cloud.oracle.com).
2. Vá em **Compute > Instances > Create Instance**.
3. Escolha a imagem **Ubuntu 22.04 LTS** ou **Ubuntu 24.04**.
4. Selecione a máquina **VM.Standard.E2.1.Micro** (Always Free) ou **Ampere A1**.
5. Baixe a sua chave privada SSH (`.key`) e clique em **Create**.

---

### Passo 2: Conectar via SSH no Servidor
No seu terminal ou PowerShell:
```bash
ssh -i sua_chave.key ubuntu@SEU_IP_PUBLICO_ORACLE
```

---

### Passo 3: Instalar Dependências e Baixar o Robô
Execute os seguintes comandos no terminal do Ubuntu:
```bash
sudo apt update && sudo apt install -y python3 python3-pip git
mkdir -p /home/ubuntu/achadinhos_bot
cd /home/ubuntu/achadinhos_bot
pip3 install requests python-dotenv schedule
```

Crie o arquivo `.env`:
```bash
nano .env
```
Cole o seguinte conteúdo com suas chaves e tags:
```env
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_KEY="sua-service-role-key-ou-anon-key"
AMAZON_TAG="seutag-20"
SHOPEE_AFF_SOURCE="seu_id_shopee"
ML_TRACKER="seu_id_mercadolivre"
MAGALU_PARCEIRO="seu_id_magalu"
CHECK_INTERVAL_SECONDS="300"
```
*(Pressione `Ctrl + O` e `Enter` para salvar, depois `Ctrl + X` para sair)*.

---

### Passo 4: Criar o Serviço para Rodar Infinitamente (Systemd)
Copie o arquivo do robô `oracle_cloud_bot.py` para a pasta `/home/ubuntu/achadinhos_bot/`.

Agora ative o serviço do sistema para que ele inicie sozinho e nunca pare:
```bash
sudo cp achadinhos_bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable achadinhos_bot
sudo systemctl start achadinhos_bot
```

### Comandos Úteis de Monitoramento:
- Ver logs em tempo real:
  ```bash
  journalctl -u achadinhos_bot -f
  ```
- Reiniciar o robô:
  ```bash
  sudo systemctl restart achadinhos_bot
  ```
- Parar o robô:
  ```bash
  sudo systemctl stop achadinhos_bot
  ```
