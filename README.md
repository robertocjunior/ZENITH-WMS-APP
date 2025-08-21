<p align="center">
  <img src="assets/icon.png" alt="Logo do App" width="200" height="200">
</p>

<h1 align="center">ZENITH WMS ANDROID APP</h1>

Um aplicativo móvel de Warehouse Management System (WMS) desenvolvido com React Native e Expo, projetado para otimizar operações de inventário e logística de forma intuitiva e eficiente.

---

## 📸 Telas Principais

| Login | Tela Principal | Detalhes |
| :---: | :---: | :---: |
| *(Adicione aqui uma captura da tela de login)* | *(Adicione aqui uma captura da tela principal)* | *(Adicione aqui uma captura da tela de detalhes)* |

---

## ✨ Funcionalidades

- **Autenticação Segura:** Sistema de login e logout com persistência de sessão e do último usuário logado.
- **Interface Temática:** Suporte completo a temas Claro (Light), Escuro (Dark) e Automático (sincronizado com o sistema operacional).
- **Gerenciamento de Armazéns:**
    - Seleção de armazém com persistência da última escolha por usuário.
    - Bloqueio inteligente do seletor quando o usuário possui acesso a apenas um armazém.
- **Consulta de Estoque:** Busca dinâmica e filtragem de itens dentro do armazém selecionado.
- **Operações de WMS:**
    - Visualização de detalhes completos do item.
    - Histórico de operações do dia.
    - Módulos para **Baixa**, **Transferência**, **Picking** e **Correção** de inventário.
- **Experiência de Usuário Polida:**
    - Animação de carregamento temática e personalizada com a identidade visual do app.
    - Transições de tela suaves e feedback tátil em todos os botões.
    - Componentes de UI customizados, como menus dropdown, para uma interface coesa.
- **Configurações Flexíveis:**
    - Modal de configurações para alterar o tema do aplicativo.
    - Configuração de endereço da API.

---

## 🚀 Tecnologias Utilizadas

- **React Native**
- **Expo**
- **React Navigation** para o gerenciamento de rotas e navegação.
- **React Native Reanimated** para animações fluidas.
- **AsyncStorage** para persistência de dados no dispositivo.

---

## ⚙️ Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-seu-repositorio>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npx expo start
    ```
    > Para limpar o cache, caso encontre algum problema, use `npx expo start -c`.

---

## 📂 Estrutura de Arquivos

O projeto está organizado da seguinte maneira:

- **/assets:** Contém todos os recursos estáticos, como ícones, imagens e fontes.
- **/components:** Componentes reutilizáveis da UI (botões, modais, cards, etc.).
- **/contexts:** Gerenciamento de estado global com a Context API (Autenticação, Tema).
- **/navigation:** Configuração das rotas e do fluxo de navegação do aplicativo.
- **/screens:** As telas principais do aplicativo (Login, Main, Details, etc.).
- **/utils:** Funções utilitárias, como formatadores de dados.
- **App.js:** O ponto de entrada principal do aplicativo.