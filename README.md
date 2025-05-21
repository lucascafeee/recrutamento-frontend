# Sistema de Recrutamento e Seleção - Frontend

## Sobre o Projeto

Frontend para um sistema de Recrutamento e Seleção, desenvolvido com React, TypeScript e Vite. O sistema permite a gestão de candidatos, vagas e etapas de processos seletivos.

## Tecnologias Utilizadas

- TypeScript
- React
- Vite
- Zustand (gerenciamento de estado)
- React Router DOM (rotas)
- Axios (requisições HTTP)
- CSS (sem uso de frameworks)

## Funcionalidades

- Autenticação (Login/Cadastro)
- Persistência de login via JWT
- Área protegida para usuários autenticados
- Redirecionamento automático baseado no status de autenticação
- Interceptores Axios para gerenciamento de token JWT
- Design responsivo (mobile-first)

## Instalação e Execução

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/recrutamento-frontend.git
   cd recrutamento-frontend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

   ```
   VITE_API_URL=http://localhost:8080/api
   ```

4. **Execute o projeto em desenvolvimento:**

   ```bash
   npm run dev
   ```

5. **Compilar para produção:**
   ```bash
   npm run build
   ```

## Backend

Este frontend foi projetado para se comunicar com uma API em Go usando o framework Gin. O backend deverá fornecer endpoints para autenticação com JWT.
