<p align="center">
<img src="assets/icon.png" alt="Logo do App" width="200" height="200">
</p>

<h1 align="center">ZENITH WMS ANDROID APP</h1>

Um aplicativo móvel de Warehouse Management System (WMS) desenvolvido com React Native e Expo, projetado para otimizar operações de inventário e logística de forma intuitiva e eficiente.

### 📸 Telas Principais

#### Login
*(Adicione aqui uma captura da tela de login)*

#### Tela Principal
*(Adicione aqui uma captura da tela principal)*

#### Detalhes
*(Adicione aqui uma captura da tela de detalhes)*

### ✨ Funcionalidades
*   **Autenticação Segura:** Sistema de login e logout com persistência de sessão e do último usuário logado.
*   **Interface Temática:** Suporte completo a temas Claro (Light), Escuro (Dark) e Automático (sincronizado com o sistema operacional).
*   **Gerenciamento de Armazéns:**
    *   Seleção de armazém com persistência da última escolha por usuário.
    *   Bloqueio inteligente do seletor quando o usuário possui acesso a apenas um armazém.
*   **Consulta de Estoque:** Busca dinâmica e filtragem de itens dentro do armazém selecionado.
*   **Operações de WMS:**
    *   Visualização de detalhes completos do item.
    *   Histórico de operações do dia.
    *   Módulos para Baixa, Transferência, Picking e Correção de inventário.
*   **Experiência de Usuário Polida:**
    *   Animação de carregamento temática e personalizada com a identidade visual do app.
    *   Transições de tela suaves e feedback tátil em todos os botões.
    *   Componentes de UI customizados, como menus dropdown, para uma interface coesa.
*   **Configurações Flexíveis:**
    *   Modal de configurações para alterar o tema do aplicativo.
    *   Configuração de endereço da API.

### 🚀 Tecnologias Utilizadas
*   **React Native**
*   **Expo**
*   **React Navigation** para o gerenciamento de rotas e navegação.
*   **React Native Reanimated** para animações fluidas.
*   **AsyncStorage** para persistência de dados no dispositivo.

### ⚙️ Como Executar o Projeto (Modo de Desenvolvimento)
Clone o repositório:
```bash
git clone <url-do-seu-repositorio>
```

Instale as dependências:
```bash
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

Para limpar o cache, caso encontre algum problema, use `npx expo start -c`.

### 📦 Como Gerar o APK Localmente (Build de Produção)
Estas instruções são para criar um APK assinado e pronto para distribuição, compilado na sua própria máquina.

#### Pré-requisitos:

*   **Ambiente Android Configurado:** É necessário ter o Android Studio, JDK e as variáveis de ambiente do Android configuradas. Siga o guia oficial do React Native em "Environment Setup", na aba "React Native CLI Quickstart".
*   **Projeto em um Caminho Curto:** Para evitar erros de compilação no Windows, certifique-se de que a pasta do projeto esteja em um caminho curto, como `C:\dev\ZENITH-WMS-APP\`.

#### Passo 1: Preparar o Ambiente Nativo (Prebuild)
Este comando cria a pasta `/android` com todo o código nativo do projeto.

**Importante:** Se a pasta `/android` já existe de uma build anterior, apague-a completamente para garantir uma configuração limpa e evitar erros de cache de caminhos.

# Apague a pasta /android se ela existir
```bash
npx expo prebuild --platform android
```

#### Passo 2: Criar a Chave de Assinatura (keystore)
Esta chave é um arquivo único que certifica a autoria do seu app. Guarde este arquivo e as senhas em um local extremamente seguro!

Navegue até a pasta `android/app`:
```bash
cd android/app
```

Execute o comando keytool para gerar a chave. Ele fará algumas perguntas e pedirá para você criar duas senhas.
```bash
keytool -genkey -v -keystore zenith-wms-app.keystore -alias zenith-wms-alias -keyalg RSA -keysize 2048 -validity 10000
```

Um arquivo `.keystore` será criado dentro da pasta `android/app`.

#### Passo 3: Configurar o Gradle para Assinatura
Edite o arquivo `android/gradle.properties` e adicione as seguintes linhas, substituindo `SUA_SENHA` pela senha que você acabou de criar:
```properties
ZENITH_RELEASE_STORE_FILE=zenith-wms-app.keystore
ZENITH_RELEASE_KEY_ALIAS=zenith-wms-alias
ZENITH_RELEASE_STORE_PASSWORD=SUA_SENHA
ZENITH_RELEASE_KEY_PASSWORD=SUA_SENHA

# Adicione esta linha para evitar erros de falta de memória durante a build
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g
```

Edite o arquivo `android/app/build.gradle` e adicione as configurações de assinatura (`signingConfigs`) dentro do bloco `android { ... }`:
```groovy
...
android {
    ...
    signingConfigs {
        debug { ... }
        release {
            if (project.hasProperty('ZENITH_RELEASE_STORE_FILE')) {
                storeFile file(ZENITH_RELEASE_STORE_FILE)
                storePassword ZENITH_RELEASE_STORE_PASSWORD
                keyAlias ZENITH_RELEASE_KEY_ALIAS
                keyPassword ZENITH_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            // Garanta que esta linha aponta para 'release'
            signingConfig signingConfigs.release 
        }
    }
    ...
}
...
```

#### Passo 4: Gerar o APK
Navegue de volta para a pasta `android`:
```bash
cd ..
```

Execute o comando de compilação.

No Windows (PowerShell):
```powershell
.\gradlew clean assembleRelease
```

No macOS/Linux:
```bash
./gradlew clean assembleRelease
```

Após a conclusão, seu APK final estará localizado em `android/app/build/outputs/apk/release/app-release.apk`.

### 📂 Estrutura de Arquivos
O projeto está organizado da seguinte maneira:

*   `/assets`: Contém todos os recursos estáticos, como ícones, imagens e fontes.
*   `/components`: Componentes reutilizáveis da UI (botões, modais, cards, etc.).
*   `/contexts`: Gerenciamento de estado global com a Context API (Autenticação, Tema).
*   `/navigation`: Configuração das rotas e do fluxo de navegação do aplicativo.
*   `/screens`: As telas principais do aplicativo (Login, Main, Details, etc.).
*   `/utils`: Funções utilitárias, como formatadores de dados.
*   `App.js`: O ponto de entrada principal do aplicativo.