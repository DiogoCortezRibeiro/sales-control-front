# Sistema de Gestão de Vendas

Sistema completo para pequenos negócios com React, NestJS e PostgreSQL.

## Funcionalidades
- Dashboard com KPIs e gráficos
- Gestão de Produtos (com controle de estoque)
- Gestão de Clientes
- Ponto de Venda (PDV) com baixa automática de estoque no fechamento
- Relatórios em tela com opção de exportação em CSV

## Como rodar o projeto

Certifique-se de ter o Docker e Docker Compose instalados na sua máquina.

1. Navegue até a pasta do projeto:
```sh
cd /home/diogo.ribeiro@db1.com.br/projeto-pessoal/vendas-app/
```

2. Suba todos os containers com build:
```sh
docker compose up --build -d
```

3. O sistema fará todo o setup automaticamente (migrações do banco e inserção do Admin e produtos/clientes de exemplo).

4. Acesse o sistema pelo navegador:
   - Frontend: [http://localhost](http://localhost) (ou http://localhost:80)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)

## Credenciais do Admin
- **Email:** `admin@vendas.com`
- **Senha:** `admin123`

## Stack
- Frontend: Vite + React + TypeScript + TailwindCSS + Recharts + Lucide
- Backend: NestJS + TypeScript + Prisma + JWT Auth
- Banco de Dados: PostgreSQL
