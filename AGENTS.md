# AGENTS.md

## Visão geral

Este repositório é uma aplicação React + Vite para gestão de uma barbearia, com rotas para login, agendamento, clientes, barbeiros, serviços, estoque, financeiro e painel administrativo. O projeto está em português e os componentes, textos e mensagens do usuário devem permanecer em português sempre que possível.

## Comandos principais

- Instalar dependências: `npm install`
- Iniciar em desenvolvimento: `npm run dev`
- Build de produção: `npm run build`
- Verificar lint: `npm run lint`
- Preview da build: `npm run preview`

## Estrutura importante

- `src/main.jsx`: bootstrap da aplicação e configuração do `BrowserRouter`
- `src/App.jsx`: definição das rotas principais usando `react-router-dom`
- `src/pages/`: páginas do sistema, organizadas por feature e nome do módulo
- `src/css/`: estilos globais e reset
- `src/assets/`: imagens e recursos estáticos
- `public/`: arquivos públicos do Vite

## Convenções do projeto

- Prefira manter cada página em uma pasta própria com componente e CSS no mesmo diretório.
- Siga o padrão existente de imports relativos para módulos da mesma aplicação.
- Quando alterar rotas, mantenha compatibilidade com os links e navegações já existentes em `src/App.jsx`.
- Os nomes de caminhos e rotas são sensíveis ao uso de navegação (`useNavigate`, `navigate('/...')`). Evite renomeações de rota sem ajustar todos os pontos de uso.
- O projeto usa `fetch` para integração com a API em `http://localhost:3333` e é comum o uso de endpoints como `/clientes`, `/servicos`, `/barbeiros`, etc.
- Em formulários, mantenha validação e mensagens em português, seguindo o estilo já usado por páginas como `src/pages/cadastroClientes/cadastroCliente.jsx`.
- Não introduza bibliotecas ou padrões de arquitetura sem necessidade; o projeto é simples e baseado em páginas com React funcional.

## Regras de edição

- Respeite a organização atual por feature em `src/pages/`.
- Preserve o padrão de componentes funcionais e hooks do React.
- Evite refatorações grandes sem necessidade; prefira mudanças focadas no módulo em questão.
- Antes de alterar estilos, verifique se a página já possui CSS específico e mantenha a estrutura visual existente.
- Se uma correção alterar comportamento de navegação ou API, valide com `npm run build` após a mudança.

## Sugestões para agentes de IA

- Quando for trabalhar em uma página específica, leia primeiro o componente e o CSS relacionados antes de editar.
- Quando for adicionar nova rota, atualize `src/App.jsx` e confirme que o caminho usado bate com o componente e a navegação do sistema.
- Quando for lidar com formulários, valide campos obrigatórios, mensagens de erro e feedback visual em português.
- Considere que o repositório pode ter nomes de arquivos e pastas inconsistentes entre maiúsculas/minúsculas; ao criar ou mover arquivos, mantenha a convenção local e ajuste imports relevantes.

## Documentação de apoio

- [README.md](README.md)
- [package.json](package.json)

Este arquivo é o guia rápido para agentes trabalhando neste projeto e deve ser mantido atualizado conforme novas features forem adicionadas.
