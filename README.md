```markdown
# Bootcamp Helper — Site Time Tracker (Manifest V3)

Extensão para Chrome que **cronometra o tempo por domínio**. Apresenta um **painel flutuante** na página e um **resumo no popup**.

> **Entrega Intermediária**: adicionados **containerização (Docker Compose)**, **testes E2E com Playwright (Chromium)** e **CI no GitHub Actions** com publicação de **artefatos** (relatório HTML e `dist/extension.zip`). Opcionalmente, criação de **Release** por tag `v*`.

---

## 🎯 Recursos

- Contagem de tempo somente quando a aba está **visível**.  
- Persistência em `chrome.storage.local` (sem servidores).  
- **Popup** com tempo do domínio atual e ações para **zerar**.  
- Preferência para exibir/ocultar o **painel flutuante**.  
- MV3 puro: **service worker**, content script e host permissions.  

**Novidades da Entrega II**
- **Dockerfile** e **docker-compose.yml** para executar testes E2E em container.  
- **Playwright (Chromium)** carregando a extensão via `--disable-extensions-except` e `--load-extension`.  
- **GitHub Actions**: build, testes e artefatos (relatório + `.zip`).  
- **Release por tag**: anexa `dist/extension.zip` automaticamente (opcional).  

---

## 🗂️ Estrutura de Pastas

```

src/
content/            tracker.js, tracker.css
background/         service-worker.js
popup/              popup.html, popup.css, popup.js
options/            options.html
assets/             logo.svg
styles/             global.css
icons/                icon16/32/48/128.png
docs/                 index.html, styles.css, img/
manifest.json

# Arquivos adicionados na Entrega II

tests/
extension.spec.ts
playwright.config.ts
scripts/
build-extension.mjs
.github/
workflows/
ci.yml
Dockerfile
docker-compose.yml
package.json

````

---

## 🔐 Permissões

- `storage` — salvar tempos e preferências.  
- `host_permissions`: `http://*/*` e `https://*/*` — para rodar o content script.  

---

## 🔒 Privacidade

- Não há coleta externa ou envio de dados.  
- Todos os registros permanecem no navegador do usuário.  

---

## 🧩 Requisitos

- **Node.js 20+**  
- **Docker** e **Docker Compose** (para execução em container)  
- **GitHub Actions** habilitado no repositório  

> Extensões no Chromium não rodam em *headless* puro. Os testes usam `headless: false`.  
> Em Linux/CI, utilize `xvfb-run -a` (configurado no workflow) para simular display.

---

## ⚙️ Scripts NPM

```json
{
  "scripts": {
    "build": "node scripts/build-extension.mjs",
    "test:e2e": "playwright test --reporter=list,html",
    "test": "npm run build && npm run test:e2e",
    "ci": "npm ci && npm run test"
  }
}
````

* `build`: gera `dist/` (cópia limpa da extensão) e `dist/extension.zip`.
* `test:e2e`: executa a suíte Playwright e produz `playwright-report/`.
* `test`: build + testes (útil localmente e no CI).

---

## 🧱 Build da Extensão

O script `scripts/build-extension.mjs`:

* Limpa/cria `dist/`.
* Copia `manifest.json`, `src/` e `icons/` para `dist/`.
* Gera `dist/extension.zip` (artefato usado no CI/Release).

---

## 🧪 Testes E2E (Playwright)

* Configuração em `tests/playwright.config.ts` (Chromium com a extensão carregada).
* Testes em `tests/extension.spec.ts`, incluindo:

  * Verificação de **service worker** (MV3) ativo.
  * Abertura de **options** e **popup** via `chrome-extension://<id>/...`.

**Caminhos esperados no Manifest (ajuste se necessário)**

* Background: `src/background/service-worker.js`
* Popup: `src/popup/popup.html`
* Options: `src/options/options.html`

---

## ▶️ Execução Local (sem Docker)

```bash
npm ci
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
npx playwright show-report
```

---

## 🐳 Execução em Container (Docker Compose)

```bash
docker compose build
docker compose run --rm e2e
```

* O serviço `e2e` executa `npm run test:e2e` dentro do container.
* `shm_size: 2gb` evita falhas do Chromium por memória compartilhada.

---

## 🤖 CI — GitHub Actions

Workflow em `.github/workflows/ci.yml`:

1. Checkout + Node 20 + cache `npm`.
2. Instalação do Playwright (`--with-deps chromium`).
3. Build → gera `dist/` + `dist/extension.zip`.
4. Testes E2E com `xvfb-run -a npm run test:e2e`.
5. Artefatos:

   * `playwright-report/` (HTML).
   * `dist/extension.zip`.
6. Release por tag (`refs/tags/v*`): cria release com anexo `dist/extension.zip`.

> Em **Settings → Actions → General → Workflow permissions**, habilite **“Read and write permissions”** para permitir criação de releases com `GITHUB_TOKEN`.

---

## 🧭 Instalação Manual (Desenvolvimento)

1. Abra `chrome://extensions` e ative **Developer mode**.
2. Clique em **Load unpacked** e selecione a pasta **`dist/`** (gerada por `npm run build`).
3. Abra qualquer site, aguarde alguns segundos e verifique o **painel flutuante** contando.
4. Clique no ícone da extensão para abrir o **popup**.

---

## 📨 Entrega (Disciplina)

* Link do repositório (público).
* Link do último run verde no **GitHub Actions**.
* Captura de tela do relatório HTML do Playwright (ou manter como artefato).
* Link da Release com `dist/extension.zip` (se optar por tag `v*`).

---

## 🩺 Troubleshooting

* **Chromium encerra/erro de memória compartilhada**: aumente `shm_size` (no Compose já está em `2gb`).
* **Relatório não aparece no CI**: verifique `reporter` em `playwright.config.ts` e o upload de artefatos.
* **ZIP inválido**: garanta que `extension.zip` não seja incluído dentro de si mesmo (o script já ignora).
* **Popup/Options não abrem no teste**: revise caminhos no `manifest.json` e ajuste os paths no teste.

---

## 📄 Licença

MIT

```
```
