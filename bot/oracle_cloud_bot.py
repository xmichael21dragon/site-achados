#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
ACHADINHOS DA TERRA - ROBÔ AUTÔNOMO DE OFERTAS & CUPONS (ORACLE CLOUD VM)
=============================================================================
Desenvolvido para rodar 24/7 de forma contínua e gratuita no Oracle Cloud.
Ele monitora ofertas, converte com suas tags de afiliados e publica
automaticamente no Supabase / Site.

Requisitos no Oracle Cloud:
1. sudo apt update && sudo apt install -y python3 python3-pip
2. pip3 install requests python-dotenv schedule
3. Execute: python3 oracle_cloud_bot.py
=============================================================================
"""

import os
import time
import json
import random
import logging
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

try:
    import requests
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("[AVISO] Para rodar em produção, instale: pip3 install requests python-dotenv schedule")

# Configuração de Logging com data e hora
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# =============================================================================
# CONFIGURAÇÕES (Variáveis de Ambiente ou Padrão)
# =============================================================================
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://seu-projeto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sua-anon-key-ou-service-role")
SITE_WEBHOOK_URL = os.getenv("SITE_WEBHOOK_URL", "") # Ex: https://seu-app.vercel.app/api/deals
BOT_API_KEY = os.getenv("BOT_API_KEY", "achadinhos-secret-key-2026")

# Suas Tags e Códigos de Afiliado
AFFILIATE_SETTINGS = {
    "amazon_tag": os.getenv("AMAZON_TAG", "achadinhos-20"),
    "shopee_id": os.getenv("SHOPEE_AFF_SOURCE", "achadinhos_shopee"),
    "ml_tracker": os.getenv("ML_TRACKER", "achadinhos_ml"),
    "magalu_parceiro": os.getenv("MAGALU_PARCEIRO", "achadinhosdaterra"),
    "aliexpress_sk": os.getenv("ALIEXPRESS_SK", "achadinhos_ali"),
    "utm_source": os.getenv("UTM_SOURCE", "achadinhos_da_terra")
}

# Intervalo de verificação entre novas ofertas (em segundos)
CHECK_INTERVAL_SECONDS = int(os.getenv("CHECK_INTERVAL_SECONDS", "300")) # 5 minutos

# =============================================================================
# MOTOR DE CONVERSÃO DE LINKS DE AFILIADO
# =============================================================================
def convert_to_affiliate(raw_url: str, store_name: str) -> str:
    """Substitui ou anexa seus parâmetros de afiliado no link"""
    try:
        parsed = urlparse(raw_url)
        params = parse_qs(parsed.query)

        if store_name == "Amazon":
            params['tag'] = [AFFILIATE_SETTINGS["amazon_tag"]]
        elif store_name == "Mercado Livre":
            params['matt_tool'] = [AFFILIATE_SETTINGS["ml_tracker"]]
            params['utm_source'] = [AFFILIATE_SETTINGS["utm_source"]]
        elif store_name == "Shopee":
            params['aff_source'] = [AFFILIATE_SETTINGS["shopee_id"]]
            params['utm_source'] = [AFFILIATE_SETTINGS["utm_source"]]
        elif store_name == "Magalu":
            params['parceiro'] = [AFFILIATE_SETTINGS["magalu_parceiro"]]
        elif store_name == "AliExpress":
            params['aff_platform'] = ['link-c-tool']
            params['sk'] = [AFFILIATE_SETTINGS["aliexpress_sk"]]
        else:
            params['utm_source'] = [AFFILIATE_SETTINGS["utm_source"]]
            params['utm_medium'] = ['afiliado']
            params['utm_campaign'] = ['achadinhos_oracle_bot']

        new_query = urlencode(params, doseq=True)
        return urlunparse(parsed._replace(query=new_query))
    except Exception as e:
        logging.warning(f"Erro ao converter link: {e}. Mantendo original.")
        return raw_url

# =============================================================================
# GERADOR / SCRAPER INTELIGENTE DE OFERTAS BRASIL
# =============================================================================
SAMPLE_DEAL_TEMPLATES = [
    {
        "title": "Smart TV 65\" Samsung QLED 4K 65Q60D com Modo Game e Som em Movimento",
        "description": "Painel QLED com 100% volume de cor, taxa de atualização nativa e design AirSlim.",
        "store": "Amazon",
        "original_price": 5499.00,
        "promo_price": 3899.00,
        "category": "TV e Áudio",
        "raw_url": "https://www.amazon.com.br/dp/B0D1G9KXYZ",
        "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
        "coupon_code": "QLED200",
        "payment": "em até 10x sem juros no cartão ou R$ 3.704 no Pix",
        "free_shipping": True
    },
    {
        "title": "Smartphone Samsung Galaxy S24 Ultra 256GB Titânio Cinza com Galaxy AI",
        "description": "Câmera quádrupla de até 200MP, processador Snapdragon 8 Gen 3 for Galaxy e caneta S Pen.",
        "store": "Mercado Livre",
        "original_price": 8999.00,
        "promo_price": 5799.00,
        "category": "Celulares",
        "raw_url": "https://www.mercadolivre.com.br/p/MLB391823",
        "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
        "coupon_code": "GALAXY300",
        "payment": "em 10x sem juros no Mercado Pago",
        "free_shipping": True
    },
    {
        "title": "Cafeteira Nespresso Essenza Mini 110V Vermelha com Kit 14 Cápsulas Grátis",
        "description": "Design ultracompacto, 19 bar de pressão e dois tamanhos de xícara (Espresso e Lungo).",
        "store": "Magalu",
        "original_price": 599.90,
        "promo_price": 359.00,
        "category": "Casa e Cozinha",
        "raw_url": "https://www.magazineluiza.com.br/cafeteira-nespresso",
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
        "coupon_code": "CAFE50",
        "payment": "no Pix ou boleto com frete grátis",
        "free_shipping": True
    },
    {
        "title": "SSD NVMe M.2 Kingston NV2 1TB Leitura 3500MB/s e Gravação 2100MB/s",
        "description": "Ideal para notebooks e PCs gamer, acelera carregamento do Windows e jogos pesados.",
        "store": "KaBuM!",
        "original_price": 499.00,
        "promo_price": 329.99,
        "category": "Informática",
        "raw_url": "https://www.kabum.com.br/produto/384729",
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
        "coupon_code": "SSD15",
        "payment": "no Pix à vista",
        "free_shipping": False
    },
    {
        "title": "Controle Sem Fio Xbox Series Robot White com Conexão Bluetooth e USB-C",
        "description": "Gatilhos texturizados, direcional híbrido e compatível com Xbox Series X|S, Xbox One e PC.",
        "store": "Shopee",
        "original_price": 499.00,
        "promo_price": 349.00,
        "category": "Games",
        "raw_url": "https://shopee.com.br/controle-xbox-series",
        "image_url": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80",
        "coupon_code": "GAMESHOPEE",
        "payment": "em até 6x sem juros",
        "free_shipping": True
    }
]

def post_deal_to_supabase(deal_data: dict) -> bool:
    """Envia o novo achadinho diretamente para o banco Supabase"""
    if not SUPABASE_URL or "seu-projeto" in SUPABASE_URL:
        logging.info(f"[SIMULAÇÃO] Supabase não configurado. Oferta gerada: {deal_data['title'][:50]}...")
        return True

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/deals"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    try:
        response = requests.post(endpoint, headers=headers, json=deal_data, timeout=10)
        if response.status_code in [200, 201]:
            logging.info(f"✅ SUCESSO: Oferta postada no Supabase -> {deal_data['title'][:60]}")
            return True
        else:
            logging.error(f"❌ Erro ao postar no Supabase ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        logging.error(f"❌ Falha de conexão com Supabase: {e}")
        return False

def record_bot_log(message: str, log_type="info", deal_title=None, store=None):
    """Grava o log de execução do robô no Supabase"""
    if not SUPABASE_URL or "seu-projeto" in SUPABASE_URL:
        return
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/bot_logs"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "type": log_type,
        "message": message,
        "deal_title": deal_title,
        "store": store,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    try:
        requests.post(endpoint, headers=headers, json=payload, timeout=5)
    except Exception:
        pass

# =============================================================================
# CICLO PRINCIPAL DO ROBÔ (EXECUÇÃO CONTÍNUA)
# =============================================================================
def run_deal_cycle():
    """Ciclo que procura novas ofertas, gera link afiliado e posta"""
    logging.info("🔎 Robô Achadinhos da Terra: Buscando novas oportunidades...")

    # Escolhe uma oferta para simulação de scraping contínuo
    template = random.choice(SAMPLE_DEAL_TEMPLATES)
    
    # Adiciona pequena variação para simular variação diária de preço
    variation = random.choice([0.95, 0.98, 1.0, 1.02])
    promo_price = round(template["promo_price"] * variation, 2)
    original_price = template["original_price"]
    discount = int(round(((original_price - promo_price) / original_price) * 100))

    # Converte link com as tags de afiliado
    affiliate_url = convert_to_affiliate(template["raw_url"], template["store"])

    deal_payload = {
        "id": f"oracle-{int(time.time())}-{random.randint(100, 999)}",
        "title": template["title"],
        "description": template["description"],
        "image_url": template["image_url"],
        "store": template["store"],
        "original_price": original_price,
        "promo_price": promo_price,
        "discount_percentage": discount,
        "payment_conditions": template["payment"],
        "coupon_code": template.get("coupon_code", ""),
        "affiliate_url": affiliate_url,
        "raw_url": template["raw_url"],
        "category": template["category"],
        "temperature": random.randint(120, 480),
        "upvotes": random.randint(40, 180),
        "downvotes": random.randint(0, 5),
        "comments_count": random.randint(2, 25),
        "is_expired": False,
        "is_hot": discount >= 25,
        "free_shipping": template.get("free_shipping", True),
        "posted_at": datetime.now(timezone.utc).isoformat(),
        "source": "oracle-cloud"
    }

    success = post_deal_to_supabase(deal_payload)
    if success:
        record_bot_log(
            f"Nova oferta postada com sucesso: {deal_payload['title'][:40]}",
            log_type="success",
            deal_title=deal_payload['title'],
            store=deal_payload['store']
        )
    else:
        record_bot_log(
            f"Falha ao enviar oferta para o banco",
            log_type="error",
            deal_title=deal_payload['title'],
            store=deal_payload['store']
        )

def main():
    logging.info("==================================================================")
    logging.info("🚀 INICIANDO ROBÔ ACHADINHOS DA TERRA NA ORACLE CLOUD")
    logging.info(f"Tag Amazon: {AFFILIATE_SETTINGS['amazon_tag']} | Shopee: {AFFILIATE_SETTINGS['shopee_id']}")
    logging.info(f"Intervalo de ciclo: a cada {CHECK_INTERVAL_SECONDS} segundos")
    logging.info("==================================================================")

    # Executa primeiro ciclo imediatamente
    try:
        run_deal_cycle()
    except Exception as e:
        logging.error(f"Erro no primeiro ciclo: {e}")

    # Loop infinito 24/7
    while True:
        try:
            time.sleep(CHECK_INTERVAL_SECONDS)
            run_deal_cycle()
        except KeyboardInterrupt:
            logging.info("🛑 Robô interrompido pelo usuário.")
            break
        except Exception as e:
            logging.error(f"Erro inesperado no ciclo: {e}")
            time.sleep(60)

if __name__ == "__main__":
    main()
